import UserAgent from "user-agents";

import { getPassport } from "./passport";
import { MajsoulApi } from "./MajsoulApi";
import { Passport } from "./types/Passport";
import { MajsoulConfigModel } from "../../../db/MajsoulConfig";
import { config } from "../../../config";
import { Cookie } from "../types/Cookie";
import { MSoulUser } from "./types/MSoulUser";
import { MajsoulAdminApi } from "./admin/MajsoulAdminApi";
import { RecordGame } from "./types/RecordGame";
import { GameRecord } from "./types/GameRecord";

export class MahjongSoulConnector {
  static #instance: MahjongSoulConnector;

  private api: MajsoulApi | undefined;
  private adminApi: MajsoulAdminApi | undefined;
  private constructor() {}

  private baseURI: string =
    "https://engs.mahjongsoul.com/api/contest_gate/api/contest/";

  static get instance(): MahjongSoulConnector {
    if (!MahjongSoulConnector.#instance) {
      MahjongSoulConnector.#instance = new MahjongSoulConnector();
    }
    return MahjongSoulConnector.#instance;
  }

  public async init() {
    const userAgent = await getOrGenerateUserAgent();
    const [apiConfig] = await MajsoulConfigModel.find().exec();

    const expireDeadline = Date.now() + 60 * 1000;
    const existingCookies = (apiConfig.loginCookies ?? []).filter(
      (cookie) => !cookie.expires || cookie.expires > expireDeadline
    );
    const { passport: dynamicPassport, loginCookies } =
      (await getPassport({
        userId: config.MAJSOUL_UID,
        accessToken: config.MAJSOUL_TOKEN,
        userAgent,
        existingCookies: (existingCookies as Cookie[]) || [],
      })) ?? {};

    await MajsoulConfigModel.updateOne(
      {
        _id: apiConfig._id,
      },
      {
        $set: {
          loginCookies,
        },
      }
    );

    if (dynamicPassport) {
      await MajsoulConfigModel.updateOne(
        {
          _id: apiConfig._id,
        },
        {
          $set: {
            passportToken: dynamicPassport.accessToken,
          },
        }
      );
    }

    const passportToken =
      dynamicPassport?.accessToken ?? apiConfig.passportToken;

    if (!passportToken) {
      console.log("failed to aquire passport");
      process.exit(1);
    }

    const passport: Passport = {
      accessToken: passportToken,
      uid: config.MAJSOUL_UID,
    };

    const apiResources = await MajsoulApi.retrieveApiResources();
    //console.log(`Using api version ${apiResources!.pbVersion}`);
    this.api = new MajsoulApi(apiResources!);

    this.api.notifications.subscribe((n: any) => console.log(n));
    await this.api.init();

    // console.log(api.majsoulCodec.decodeMessage(Buffer.from("", "hex")));

    await this.api.logIn(passport);

    this.api.errors$.subscribe((error: any) => {
      console.log("error detected with api connection: ", error);
      process.exit(1);
    });

    this.adminApi = new MajsoulAdminApi();

    // console.log("Initializing admin api...");
    // await this.adminApi.init();
    // const adminLogin: lq.ResContestManageOauth2Login =
    //   await this.adminApi.logIn(passport);
    // if (adminLogin.error) {
    //   console.log(
    //     "error detected with admin api connection: ",
    //     adminLogin.error
    //   );
    //   process.exit(1);
    // }
    // console.log("Admin api initialized.");

    // const game = await api.getGame(
    //   Codec.decodePaipuId(
    //     "jijpnt-q3r346x6-y108-64fk-hbbn-lkptsjjyoszx_a925250810_2"
    //   ).split("_")[0]
    // );

    //spreadsheet.addGameDetails(await api.getGame(decodePaipuId("jijpnt-q3r346x6-y108-64fk-hbbn-lkptsjjyoszx_a925250810_2").split('_')[0]));

    // api.getGame(
    // 	// Codec.decodePaipuId("")
    // 	// ""
    // ).then(game => {
    // 	parseGameRecordResponse(game);
    // 	// console.log(util.inspect(game.head, false, null));
    // 	// console.log(util.inspect(parseGameRecordResponse(game), false, null));
    // });
  }

  public async getUserInfoFromFriendId(id: string) {
    const majsoulId = await this.api?.getAccountIdFromFriendId(id);
    if (majsoulId === undefined) {
      return { nickname: undefined, accountId: undefined };
    }
    const accountInfo = await this.api?.fetchAccountInfo(majsoulId);
    return { nickname: accountInfo?.account?.nickname, accountId: majsoulId };
  }

  public async getUserNicknameFromAccountId(
    id: string
  ): Promise<string | undefined> {
    const accountInfo = await this.api?.fetchAccountInfo(parseInt(id));
    return accountInfo?.account?.nickname;
  }

  public async fetchContestDetails(contestId: string) {
    const url = new URL(`${this.baseURI}fetch_contest_detail`);
    url.searchParams.append("unique_id", contestId);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Majsoul abc`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch contest details: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  public async fetchPlayerReadyList(contestId: string): Promise<MSoulUser[]> {
    const url = new URL(`${this.baseURI}ready_player_list`);
    url.searchParams.append("unique_id", contestId);
    url.searchParams.append("season_id", "1");
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Majsoul abc`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch player ready list: ${response.status} ${response.statusText}`
      );
    }
    return (await response.json()).data as MSoulUser[];
  }

  public async getAllContestGameRecords({
    contestId,
    seasonId,
  }: {
    contestId: number;
    seasonId?: number;
  }): Promise<RecordGame[]> {
    if (!this.api) {
      throw new Error("API not initialized. Call init() first.");
    }
    return this.api.getAllContestGameRecords(contestId, seasonId);
  }

  public async getContestGameRecord(gameId: string): Promise<GameRecord> {
    if (!this.api) {
      throw new Error("API not initialized. Call init() first.");
    }
    return this.api.getGame(gameId);
  }
}

export async function getOrGenerateUserAgent(): Promise<string> {
  let [apiConfig] = await MajsoulConfigModel.find().exec();
  if (!apiConfig?.userAgent) {
    if (!apiConfig) {
      apiConfig = await MajsoulConfigModel.create({});
    }
    apiConfig.userAgent = new UserAgent({
      platform: process.platform === "win32" ? "Win32" : "Linux x86_64",
    }).toString();

    await MajsoulConfigModel.updateOne(
      {
        _id: apiConfig._id,
      },
      {
        $set: {
          userAgent: apiConfig.userAgent,
        },
      }
    );
  }
  return apiConfig.userAgent;
}
