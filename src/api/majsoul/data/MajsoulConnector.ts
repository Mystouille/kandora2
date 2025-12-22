import UserAgent from "user-agents";

import { getPassport } from "./passport";
import { MajsoulApi } from "./MajsoulApi";
import { Passport } from "./types/Passport";
import { MajsoulConfig } from "../../../db/MajsoulConfig";
import { config } from "../../../config";
import { Cookie } from "../types/Cookie";

export class MahjongSoulConnector {
  static #instance: MahjongSoulConnector;

  private api: MajsoulApi | undefined;
  private constructor() {}

  static get instance(): MahjongSoulConnector {
    if (!MahjongSoulConnector.#instance) {
      MahjongSoulConnector.#instance = new MahjongSoulConnector();
    }
    return MahjongSoulConnector.#instance;
  }

  public async init() {
    const userAgent = await getOrGenerateUserAgent();
    const [apiConfig] = await MajsoulConfig.find().exec();

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

    await MajsoulConfig.updateOne(
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
      await MajsoulConfig.updateOne(
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
    const api = new MajsoulApi(apiResources!);

    api.notifications.subscribe((n: any) => console.log(n));
    await api.init();

    // console.log(api.majsoulCodec.decodeMessage(Buffer.from("", "hex")));

    await api.logIn(passport);

    api.errors$.subscribe((error: any) => {
      console.log("error detected with api connection: ", error);
      process.exit(1);
    });

    this.api = api;

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
}

export async function getOrGenerateUserAgent(): Promise<string> {
  let [apiConfig] = await MajsoulConfig.find().exec();
  if (!apiConfig?.userAgent) {
    if (!apiConfig) {
      apiConfig = await MajsoulConfig.create({});
    }
    apiConfig.userAgent = new UserAgent({
      platform: process.platform === "win32" ? "Win32" : "Linux x86_64",
    }).toString();

    await MajsoulConfig.updateOne(
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
