import fetch from "node-fetch";
import { Root } from "protobufjs";
import { from, interval, merge, Observable, of, using } from "rxjs";
import { catchError, filter, map, mergeAll, timeout } from "rxjs/operators";
import { v4 as uuidv4 } from "uuid";

import { Codec } from "./Codec";
import { Connection } from "./Connection";
import { RpcImplementation } from "./RpcImplementation";
import { RpcService } from "./Service";
import { ApiResources } from "./types/ApiResources";
import { Contest } from "./types/Contest";
import { MessageType } from "./types/enums/MessageType";
import { PlayerZone } from "./types/enums/PlayerZone";
import { GameRecord } from "./types/GameRecord";
import * as lq from "./types/liqi";
import { Passport } from "./types/Passport";
import { Player } from "./types/Player";
import { CustomLobbyConnection } from "./CustomLobbyConnection";
import { RecordGame } from "./types/RecordGame";

export class MajsoulApi {
  private static async getRes<T>(path: string): Promise<T> {
    return (await fetch(path)).json() as Promise<T>;
  }

  public static async retrieveApiResources(): Promise<
    ApiResources | undefined
  > {
    const majsoulUrl = "https://mahjongsoul.game.yo-star.com/";
    const versionInfo = await MajsoulApi.getRes<any>(
      majsoulUrl + "version.json?randv=" + Math.random().toString().slice(2)
    );
    const resInfo = await MajsoulApi.getRes<any>(
      majsoulUrl + `resversion${versionInfo.version}.json`
    );
    const pbVersion = resInfo.res["res/proto/liqi.json"].prefix;
    const pbDef = await MajsoulApi.getRes<any>(
      majsoulUrl + `${pbVersion}/res/proto/liqi.json`
    );
    return {
      version: versionInfo.version,
      pbVersion,
      serverList: { servers: ["engsbk.mahjongsoul.com"] },
      protobufDefinition: pbDef,
    };
  }

  private readonly protobufRoot: Root;
  private readonly connection: Connection;
  private readonly rpc: RpcImplementation;
  public readonly lobbyService: RpcService;
  private readonly codec: Codec;
  private readonly clientVersion: string;
  public readonly notifications: Observable<any>;

  constructor(private readonly apiResources: ApiResources) {
    this.protobufRoot = Root.fromJSON(apiResources.protobufDefinition);
    this.clientVersion = `web-${apiResources.version.slice(0, -2)}`;
    //console.log(`Client version: [${this.clientVersion}]`);
    this.codec = new Codec(this.protobufRoot);

    this.connection = new Connection(
      `wss://${apiResources.serverList.servers[0]}/gateway`
    );
    this.notifications = this.connection.messages.pipe(
      filter((message) => message.type === MessageType.Notification),
      map((message) => this.codec.decode(message.data))
    );
    this.rpc = new RpcImplementation(this.connection, this.protobufRoot);
    this.lobbyService = this.rpc.getService("Lobby");
  }

  public static getPlayerZone(playerId: number): PlayerZone {
    if (isNaN(playerId)) {
      return PlayerZone.Unknown;
    }

    const regionBits = playerId >> 23;

    if (regionBits >= 0 && regionBits <= 6) {
      return PlayerZone.China;
    }

    if (regionBits >= 7 && regionBits <= 12) {
      return PlayerZone.Japan;
    }

    if (regionBits >= 13 && regionBits <= 15) {
      return PlayerZone.Other;
    }

    return PlayerZone.Unknown;
  }

  public get errors$(): Observable<any> {
    return merge(
      this.connection.errors$,
      interval(1000 * 60).pipe(
        map((number) =>
          from(
            this.lobbyService.rpcCall<lq.ReqHeatBeat>("heatbeat", {
              no_operation_counter: number,
            })
          ).pipe(
            timeout(3000),
            filter(() => false),
            catchError(() => of("heartbeat failed"))
          )
        ),
        mergeAll()
      )
    );
  }

  public get majsoulCodec(): Codec {
    return this.codec;
  }

  public async init(): Promise<void> {
    await this.connection.init();
    // this.lobbyService.rpcCall
  }

  public async logIn(passport: Passport): Promise<lq.ResOauth2Check> {
    const type = 7;

    const respOauth2Auth = await this.lobbyService.rpcCall<
      lq.ReqOauth2Auth,
      lq.ResOauth2Auth
    >("oauth2Auth", {
      type,
      code: passport.accessToken,
      uid: passport.uid,
      client_version_string: this.clientVersion,
    });

    const reqOauth2Check: lq.ReqOauth2Check = {
      type,
      access_token: respOauth2Auth.access_token,
    };

    let respOauth2Check = await this.lobbyService.rpcCall<
      lq.ReqOauth2Check,
      lq.ResOauth2Check
    >("oauth2Check", reqOauth2Check);
    if (!respOauth2Check.has_account) {
      await new Promise((res) => setTimeout(res, 2000));
      respOauth2Check = await this.lobbyService.rpcCall(
        "oauth2Check",
        reqOauth2Check
      );
    }

    const respOauth2Login = await this.lobbyService.rpcCall<
      lq.ReqOauth2Login,
      lq.ResLogin
    >("oauth2Login", {
      type,
      currency_platforms: [2, 9],
      access_token: respOauth2Auth.access_token,
      reconnect: false,
      device: {
        platform: "pc",
        hardware: "pc",
        os: "windows",
        os_version: "win10",
        is_browser: true,
        software: "Chrome",
        sale_platform: "web",
      },
      random_key: uuidv4(),
      client_version: { resource: this.apiResources.version },
      client_version_string: this.clientVersion,
    });

    if (!respOauth2Login.account) {
      throw Error("Couldn't log in to user id");
    }
    console.log(
      `Logged in to Majsoul as ${respOauth2Login.account.nickname} account id ${respOauth2Login.account_id}`
    );

    return respOauth2Login;
  }

  public async getAccountIdFromFriendId(
    friendId: string
  ): Promise<number | undefined> {
    const resp = await this.lobbyService.rpcCall<
      lq.ReqSearchAccountByPattern,
      lq.ResSearchAccountByPattern
    >("searchAccountByPattern", {
      pattern: friendId,
    });
    return resp.decode_id;
  }

  public fetchAccountStatisticInfo(
    accountId: number
  ): Promise<lq.ResAccountStatisticInfo> {
    return this.lobbyService.rpcCall<
      lq.ReqAccountStatisticInfo,
      lq.ResAccountStatisticInfo
    >("fetchAccountStatisticInfo", {
      account_id: accountId,
    });
  }

  public fetchAccountInfo(accountId: number): Promise<lq.ResAccountInfo> {
    return this.lobbyService.rpcCall<lq.ReqAccountInfo, lq.ResAccountInfo>(
      "fetchAccountInfo",
      {
        account_id: accountId,
      }
    );
  }

  public async findContestByContestId(id: number): Promise<Contest | null> {
    const resp = await this.lobbyService.rpcCall<
      lq.ReqFetchCustomizedContestByContestId,
      lq.ResFetchCustomizedContestByContestId
    >("fetchCustomizedContestByContestId", {
      contest_id: id,
    });

    if (resp.contest_info === undefined) {
      return null;
    }

    return {
      majsoulId: resp.contest_info.unique_id!,
      majsoulFriendlyId: resp.contest_info.contest_id!,
      name: resp.contest_info.contest_name!,
      createdTime: resp.contest_info.create_time! * 1000,
      startTime: resp.contest_info.start_time! * 1000,
      finishTime: resp.contest_info.finish_time! * 1000,
    };
  }

  public async getContestGamesIds(
    id: number,
    target_game?: string
  ): Promise<
    {
      majsoulId: string;
    }[]
  > {
    const games = [] as lq.RecordGame[];
    let nextIndex = undefined;

    while (true) {
      const resp: lq.ResFetchCustomizedContestGameRecords =
        await this.lobbyService.rpcCall<
          lq.ReqFetchCustomizedContestGameRecords,
          lq.ResFetchCustomizedContestGameRecords
        >("fetchCustomizedContestGameRecords", {
          unique_id: id,
          last_index: nextIndex,
        });
      games.push(...(resp.record_list ?? []));
      if (
        !resp.next_index ||
        !resp.record_list?.length ||
        resp.record_list?.find((c) => c.uuid === target_game)
      ) {
        break;
      }
      nextIndex = resp.next_index;
    }

    const data = games.map((g) => ({ majsoulId: g.uuid })) as {
      majsoulId: string;
    }[];

    const target = games.findIndex((g) => g.uuid === target_game) + 1;
    if (target === 0) {
      return data;
    }

    return data.slice(0, target);
  }

  public async getAllContestGameRecords(
    contestId: number,
    seasonId?: number
  ): Promise<lq.RecordGame[]> {
    const games = [] as RecordGame[];
    let nextIndex = -1;

    // Fetch all game record metadata with pagination
    // eslint-disable-next-line no-constant-condition
    while (nextIndex !== undefined) {
      const resp: lq.ResFetchCustomizedContestGameRecords =
        await this.lobbyService.rpcCall<
          lq.ReqFetchCustomizedContestGameRecords,
          lq.ResFetchCustomizedContestGameRecords
        >("fetchCustomizedContestGameRecords", {
          unique_id: contestId,
          last_index: nextIndex >= 0 ? nextIndex : undefined,
          season_id: seasonId,
        });

      games.push(...(resp.record_list ?? []));

      if (!resp.next_index || !resp.record_list?.length) {
        break;
      }
      nextIndex = resp.next_index;
    }

    return games;
  }

  public subscribeToContestChatSystemMessages(id: number): Observable<any> {
    console.log("subscribeToContestChatSystemMessages", id);
    const connection = this.connection;
    return using(
      () => {
        return {
          unsubscribe: function () {
            connection?.close();
          },
        };
      },
      (resource: any) => {
        return from(
          this.lobbyService
            .rpcCall<
              lq.ReqJoinCustomizedContestChatRoom,
              lq.ResJoinCustomizedContestChatRoom
            >("joinCustomizedContestChatRoom", { unique_id: id })
            .then((resp) => {
              resource.connection = new CustomLobbyConnection(
                `wss://contesten.mahjongsoul.com:8200/client?stream=binary&token=${resp.token}&supportid=true&message_id=0&system_id=0`
              );
              console.log("subscribeToContestChatSystemMessages");

              resource.connection.init();
              return resource.connection.messages;
            })
        ).pipe(mergeAll());
      }
    );
  }

  public async findPlayerByFriendlyId(
    majsoulFriendlyId: number
  ): Promise<Player | undefined> {
    try {
      const resp = await this.lobbyService.rpcCall<
        lq.ReqSearchAccountByPattern,
        lq.ResSearchAccountByPattern
      >("searchAccountByPattern", { pattern: majsoulFriendlyId.toString() });
      if (!resp.decode_id) {
        return undefined;
      }

      const players = (
        await this.lobbyService.rpcCall<
          lq.ReqMultiAccountId,
          lq.ResMultiAccountBrief
        >("fetchMultiAccountBrief", { account_id_list: [resp.decode_id] })
      ).players;
      if (players && players.length > 0) {
        return {
          majsoulId: players[0].account_id!,
          nickname: players[0].nickname!,
        };
      }
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }

  public async getGame(id: string): Promise<GameRecord> {
    let resp: lq.ResGameRecord = {
      data: undefined,
      data_url: undefined,
      error: undefined,
      head: undefined,
    };
    try {
      resp = await this.lobbyService.rpcCall<
        lq.ReqGameRecord,
        lq.ResGameRecord
      >("fetchGameRecord", {
        game_uuid: id,
        client_version_string: this.clientVersion,
      });
      const details = this.codec.decode<lq.GameDetailRecords>(
        resp.data as unknown as Buffer
      );

      return {
        ...resp,
        records: (details.records?.length
          ? details.records?.length > 0
            ? details.records
            : details
                .actions!.filter((action) => action.type === 1)
                .map((action) => action.result)
          : []
        ).map((item) => this.codec.decode(item as unknown as Buffer)),
      };
    } catch (e) {
      console.log(`Couldn't find game ${id}`);
      console.log(resp);
      throw new Error(`Couldn't find game ${id}`);
    }
  }

  public dispose() {
    this.connection.close();
  }
}
