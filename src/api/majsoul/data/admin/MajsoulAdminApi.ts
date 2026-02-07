import * as proto from "./types/proto.json";
import fetch from "node-fetch";
import { Codec } from "../Codec";
import { Connection } from "../Connection";
import * as lq from "./types/proto";
import { Passport } from "../types/Passport";
import * as protobuf from "protobufjs";
const { Root } = protobuf;
import { RpcImplementation } from "../RpcImplementation";
import { RpcService } from "../Service";

export class MajsoulAdminApi {
  private static async getRes<T>(path: string): Promise<T> {
    return (await fetch(path)).json() as Promise<T>;
  }

  private readonly protobufRoot: Root;
  private readonly connection: Connection;
  private readonly rpc: RpcImplementation;
  private readonly contestManagerApiService: RpcService;
  private readonly codec: Codec;

  constructor() {
    this.protobufRoot = Root.fromJSON(proto as any);
    this.codec = new Codec(this.protobufRoot);
    this.connection = new Connection(
      "wss://engs.mahjongsoul.com/api/contest_gate"
    );
    this.rpc = new RpcImplementation(this.connection, this.protobufRoot);
    this.contestManagerApiService = this.rpc.getService(
      "CustomizedContestManagerApi"
    );
  }

  public get majsoulCodec(): Codec {
    return this.codec;
  }

  public async init(): Promise<void> {
    await this.connection.init();
  }

  public async logIn(
    passport: Passport
  ): Promise<lq.ResContestManageOauth2Login> {
    const type = 8;

    const respOauth2Auth = await this.contestManagerApiService.rpcCall<
      lq.ReqContestManageOauth2Auth,
      lq.ResContestManageOauth2Auth
    >("oauth2AuthContestManager", {
      type,
      code: passport.accessToken,
      uid: passport.uid,
    });

    const reqOauth2Check: lq.ReqContestManageOauth2Login = {
      type,
      access_token: respOauth2Auth.access_token,
    };

    const respOauth2Check = await this.contestManagerApiService.rpcCall<
      lq.ReqContestManageOauth2Login,
      lq.ResContestManageOauth2Login
    >("oauth2LoginContestManager", reqOauth2Check);
    return respOauth2Check;
  }

  public manageContest(contestId: number): Promise<lq.ResManageContest> {
    return this.contestManagerApiService.rpcCall<
      lq.ReqManageContest,
      lq.ResManageContest
    >("manageContest", {
      unique_id: contestId,
    });
  }

  public fetchContestPlayers(): Promise<lq.ResFetchCustomizedContestPlayer> {
    return this.contestManagerApiService.rpcCall<
      lq.ReqCommon,
      lq.ResFetchCustomizedContestPlayer
    >("fetchContestPlayer", {});
  }

  public reconnect(): Promise<void> {
    return this.connection.reconnect();
  }

  public disconnect() {
    this.connection.close();
  }

  public dispose() {
    this.connection.close();
  }
}
