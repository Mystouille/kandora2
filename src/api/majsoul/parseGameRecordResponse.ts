import { GameRecord } from "./data/types/GameRecord";
import * as lq from "./data/types/liqi";
import { syanten } from "syanten";

import { Han } from "./data/enums";
import { RoundInfo } from "./types/game/round/RoundInfo";
import { handToSyantenFormat } from "./handToSyantenFormat";
import {
  GameRecordData,
  getNewRoundEndEvent,
  RoundEndEvent,
  UsersRounds,
} from "./types/gameRecordData";

export function parseGameRecordResponse(game: GameRecord): GameRecordData {
  if (!game?.data_url && !game?.data?.length) {
    console.log("No data in response");
    throw new Error("No data in response");
  }

  const numberOfPlayers: number = 4;

  let round: RoundInfo | undefined = undefined;

  const gameData: GameRecordData = {
    gameId: game.head?.uuid ?? "",
    startTime: new Date((game.head?.start_time ?? 0) * 1000),
    endTime: new Date((game.head?.end_time ?? 0) * 1000),
    byUserData: [],
  };
  game.head?.accounts?.forEach((account) => {
    const userRoundData: UsersRounds = {
      userId: account.account_id?.toString() || "",
      seat: account.seat!,
      nickname: account.nickname || "",
      roundEvents: [],
    };
    gameData.byUserData.push(userRoundData);
  });

  let playerRoundData: RoundEndEvent[] = [];
  let playerTurn: number[] = [0, 0, 0, 0];
  let playerTenpaiStatus: boolean[] = [false, false, false, false];
  let lastDiscarder: number | null = null;

  if (game.records?.[0]?.constructor?.name !== "RecordNewRound") {
    console.log("Game record does not start with RecordNewRound");
    throw new Error("Game record does not start with RecordNewRound");
  }

  for (let i = 0; i < game.records.length; i++) {
    const record = game.records[i];

    switch (record.constructor.name) {
      case "RecordNewRound": {
        const recordNewRound = record as lq.RecordNewRound;
        round = {
          round: recordNewRound.chang!,
          dealership: recordNewRound.ju!,
          repeat: recordNewRound.ben!,
        };

        lastDiscarder = null;
        playerTurn = [0, 0, 0, 0];
        playerRoundData = [];
        for (let p = 0; p < numberOfPlayers; p++) {
          playerRoundData.push(
            getNewRoundEndEvent(
              game.head?.accounts
                ?.find((a) => a.seat === p)
                ?.account_id?.toString() || ""
            )
          );
        }
        playerTenpaiStatus = [false, false, false, false];

        playerRoundData[round.dealership].wasDealer = true;
        for (let p = 0; p < numberOfPlayers; p++) {
          const suitTiles =
            p == 0
              ? recordNewRound.tiles0
              : p == 1
                ? recordNewRound.tiles1
                : p == 2
                  ? recordNewRound.tiles2
                  : recordNewRound.tiles3;
          playerRoundData[p].haipaiShanten = syanten(
            handToSyantenFormat(suitTiles!)
          );
        }

        break;
      }
      case "RecordDiscardTile": {
        const recordDiscardTile = record as lq.RecordDiscardTile;
        const discardSeat = recordDiscardTile.seat;
        playerTurn[discardSeat!]++;

        if (recordDiscardTile.is_wliqi || recordDiscardTile.is_liqi) {
          playerRoundData[discardSeat!].hasRiichi = true;
          if (
            recordDiscardTile.tingpais &&
            recordDiscardTile.tingpais?.length > 0
          ) {
            playerRoundData[discardSeat!].firstTenpaiTurn =
              playerTurn[discardSeat!];
          }
          playerTenpaiStatus[discardSeat!] = !!(
            recordDiscardTile.tingpais && recordDiscardTile.tingpais?.length > 0
          );
        }
        lastDiscarder = discardSeat!;
        break;
      }
      case "RecordDealTile": {
        break;
      }
      case "RecordAnGangAddGang": {
        const recordAnGangAddGang = record as lq.RecordAnGangAddGang;
        switch (recordAnGangAddGang.type) {
          // shouminkan
          case 2: {
            playerRoundData[recordAnGangAddGang.seat!].wasOpened = true;
            playerRoundData[recordAnGangAddGang.seat!].numberOfCalls++;
            break;
          }
          // ankan
          case 3: {
            break;
          }
        }
        playerRoundData[recordAnGangAddGang.seat!].kanNumber++;
        break;
      }
      case "RecordChiPengGang": {
        const recordChiPengGang = record as lq.RecordChiPengGang;
        playerRoundData[recordChiPengGang.seat!].numberOfCalls++;
        playerRoundData[recordChiPengGang.seat!].wasOpened = true;
        break;
      }
      case "RecordNoTile": {
        const recordNoTile = record as lq.RecordNoTile;
        const nbTenpai = recordNoTile.players?.filter((p) => p.tingpai).length;
        recordNoTile.players?.forEach((player, index) => {
          playerRoundData[index].ryuukyoku = true;
          playerRoundData[index].finishedTenpai = !!player.tingpai;
          switch (nbTenpai) {
            case 1:
              playerRoundData[index].ryuukyokuValue = player.tingpai
                ? 3000
                : -1000;
              break;
            case 2:
              playerRoundData[index].ryuukyokuValue = player.tingpai
                ? 1500
                : -1500;
              break;
            case 3:
              playerRoundData[index].ryuukyokuValue = player.tingpai
                ? 1000
                : -3000;
              break;
          }
        });

        gameData.byUserData.forEach((userData) => {
          const rounds = playerRoundData.filter(
            (data) => data.userId === userData.userId
          );
          if (rounds.length > 0) {
            userData.roundEvents.push(rounds[0]);
          }
        });
        break;
      }
      case "RecordHule": {
        const recordHule = record as lq.RecordHule;

        recordHule.hules?.forEach((hule) => {
          playerRoundData[hule.seat!].isWinner = true;
          playerRoundData[hule.seat!].winningTile = hule.hu_tile;
          playerRoundData[hule.seat!].hanValue = hule.count || 0;
          playerRoundData[hule.seat!].fuValue = hule.fu || 0;
          playerRoundData[hule.seat!].isTsumo = hule.zimo || false;
          if (!hule.zimo) {
            playerRoundData[lastDiscarder!].gotRonned = true;
          }
          playerRoundData[hule.seat!].hasRiichi = hule.liqi || false;
          playerRoundData[hule.seat!].yakus =
            hule.fans?.map((f) => f.id).filter((id) => id !== undefined) || [];
          playerRoundData[hule.seat!].totalDoraValue =
            hule.fans
              ?.filter(
                (han) =>
                  han.id === Han.Dora ||
                  han.id === Han.Red_Five ||
                  han.id == Han.Ura_Dora
              )
              .reduce((acc, han) => acc + (han.val || 0), 0) || 0;
          playerRoundData[hule.seat!].uraDoraValue =
            hule.fans
              ?.filter((han) => han.id == Han.Ura_Dora)
              .reduce((acc, han) => acc + (han.val || 0), 0) || 0;
        });
        recordHule.delta_scores?.forEach((delta_score, index) => {
          playerRoundData[index].pointsDiff += delta_score;
        });

        gameData.byUserData.forEach((userData) => {
          const rounds = playerRoundData.filter(
            (data) => data.userId === userData.userId
          );
          if (rounds.length > 0) {
            userData.roundEvents.push(rounds[0]);
          }
        });
        break;
      }
    }
  }
  return gameData;
}
