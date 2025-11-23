import { GameRecord } from "./data/types/GameRecord";
import * as lq from "./data/types/liqi";
import { syanten } from "syanten";

import { Han } from "./data/enums";
import { RoundInfo } from "./types/game/round/RoundInfo";
import { AgariInfo } from "./types/game/round/AgariInfo";
import { GameResult } from "./types/game/GameResult";
import { RoundResult } from "./types/game/round/RoundResult";
import { PlayerStats } from "./types/game/round/PlayerStats";
import { handToSyantenFormat } from "./handToSyantenFormat";
import { HandStatus } from "./types/enums/HandStatus";
import { DrawStatus } from "./types/enums/DrawStatus";
import { latestGameResultVersion } from "./types/enums/GameResultVersion";

function getAgariRecord(
  record: any,
  hule: lq.HuleInfo,
  round: RoundInfo
): AgariInfo {
  const value = hule.zimo
    ? hule.seat === round.dealership
      ? (hule.point_zimo_xian ?? 0) * 3
      : (hule.point_zimo_qin ?? 0) + (hule.point_zimo_xian || 0) * 2
    : (hule.point_rong ?? 0) - (hule.liqi ? 1000 : 0);
  return {
    extras: record.delta_scores[hule.seat!] - value - (hule.liqi ? 1000 : 0),
    riichi: hule.liqi,
    value,
    winner: hule.seat!,
    han: (hule.fans as any[])
      .map((f) => {
        if ([Han.Dora, Han.Red_Five, Han.Ura_Dora].indexOf(f.id) >= 0) {
          return Array(f.val).fill(f.id);
        }
        return [f.id];
      })
      .flat(),
  };
}

export function parseGameRecordResponse(game: GameRecord): GameResult {
  if (!game?.data_url && !game?.data?.length) {
    console.log("No data in response");
    throw new Error("No data in response");
  }

  // TODO: take this from game metadata
  const numberOfPlayers: number = 4;
  const rounds: RoundResult[] = [];

  let round: RoundInfo | undefined = undefined;
  let losingSeat: number | undefined;
  let kan_lock = new Set();
  let playerStats: PlayerStats[] = [];

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

        kan_lock = new Set();

        playerStats = [];
        for (let p = 0; p < numberOfPlayers; p++) {
          const suitTiles =
            p == 0
              ? recordNewRound.tiles0
              : p == 1
                ? recordNewRound.tiles1
                : p == 2
                  ? recordNewRound.tiles2
                  : recordNewRound.tiles3;
          playerStats[p] = {
            haipaiShanten: syanten(handToSyantenFormat(suitTiles!)),
            calls: {
              kans: {
                ankan: 0,
                daiminkan: 0,
                rinshan: 0,
                shouminkan: 0,
                shouminkanRobbed: 0,
              },
              total: 0,
              repeatOpportunities: 0,
              opportunities: 0,
            },
            finalHandState: {
              status: HandStatus.Closed,
            },
          };
        }
        break;
      }
      case "RecordDiscardTile": {
        const recordDiscardTile = record as lq.RecordDiscardTile;
        losingSeat = recordDiscardTile.seat;

        if (recordDiscardTile.is_wliqi || recordDiscardTile.is_liqi) {
          playerStats[recordDiscardTile.seat!].finalHandState = {
            status: HandStatus.Riichi,
            index: playerStats.filter(
              (player) => player.finalHandState.status === HandStatus.Riichi
            ).length,
            furiten: recordDiscardTile.zhenting![recordDiscardTile.seat!],
          };
        }

        //calls
        if (!game.data?.length || game.data?.length <= i) {
          console.log("Game record ends with Discard event");
          break;
        }

        if (!recordDiscardTile.operations) {
          break;
        }

        const recordNext = game.records[i + 1];
        if (!recordNext) {
          break;
        }

        if (recordNext.constructor.name === "RecordHule") {
          //somebody ronned. nobody could call anyways
          break;
        }

        if (recordNext.constructor.name === "RecordChiPengGang") {
          const nextRecordChiPengGang = recordNext as lq.RecordChiPengGang;
          //somebody called
          if (nextRecordChiPengGang.type !== 0) {
            //somebody chii'd. count all
            playerStats[nextRecordChiPengGang.seat!].calls.opportunities++;
            break;
          }
        }

        //ignoring ron calls, get list of seats that can call
        const callOpportunities = recordDiscardTile.operations
          .filter(
            (x) => (x.operation_list ?? []).find((op) => op.type !== 9) != null
          )
          .reduce(
            (total, next) => (total.add(next.seat!), total),
            new Set<number>()
          );

        for (const player of callOpportunities) {
          playerStats[player].calls.opportunities++;
        }

        break;
      }
      case "RecordDealTile": {
        const recordDealTile = record as lq.RecordDealTile;
        //shouminkan/ankan opportunity (types 4/6)
        if (!recordDealTile.operation?.operation_list) {
          break;
        }

        const kans = recordDealTile.operation.operation_list.filter(
          (e) => 4 == e.type || 6 == e.type
        );
        for (const kan of kans) {
          if (!kan.combination) {
            continue;
          }
          if (kan.combination && kan_lock.has(kan.combination[0])) {
            playerStats[recordDealTile.seat!].calls.repeatOpportunities++;
            continue;
          }
          playerStats[recordDealTile.seat!].calls.opportunities++;
          kan_lock.add(kan.combination[0]);
        }
        break;
      }
      case "RecordAnGangAddGang": {
        const recordAnGangAddGang = record as lq.RecordAnGangAddGang;
        playerStats[recordAnGangAddGang.seat!].calls.total++;
        switch (recordAnGangAddGang.type) {
          case 2: {
            playerStats[recordAnGangAddGang.seat!].calls.kans.shouminkan++;
            break;
          }
          case 3: {
            playerStats[recordAnGangAddGang.seat!].calls.kans.ankan++;
            break;
          }
        }
        losingSeat = recordAnGangAddGang.seat;
        break;
      }
      case "RecordChiPengGang": {
        const recordChiPengGang = record as lq.RecordChiPengGang;
        playerStats[recordChiPengGang.seat!].calls.total++;

        if (recordChiPengGang.type === 2) {
          playerStats[recordChiPengGang.seat!].calls.kans.daiminkan++;
        }

        if (
          playerStats[recordChiPengGang.seat!].finalHandState.status ===
          HandStatus.Open
        ) {
          break;
        }

        playerStats[recordChiPengGang.seat!].finalHandState = {
          status: HandStatus.Open,
        };
        break;
      }
      case "RecordNoTile": {
        const recordNoTile = record as lq.RecordNoTile;

        rounds.push({
          round: round!,
          draw: {
            playerDrawStatus: (recordNoTile.players as any[]).map(
              (player, index) => {
                if (
                  recordNoTile.liujumanguan &&
                  (recordNoTile.scores as any[]).find(
                    (score) => score.seat === index
                  )
                ) {
                  return DrawStatus.Nagashi_Mangan;
                }
                return player.tingpai ? DrawStatus.Tenpai : DrawStatus.Noten;
              }
            ),
          },
          playerStats,
        });
        break;
      }
      case "RecordHule": {
        const recordHule = record as lq.RecordHule;

        if (recordHule.hules && recordHule.hules[0].zimo) {
          const hule = recordHule.hules[0];
          const agariInfo = getAgariRecord(record, hule, round!);
          rounds.push({
            round: round!,
            tsumo: {
              ...agariInfo,
              dealerValue: hule.point_zimo_qin!,
            },
            playerStats,
          });

          if (agariInfo.han?.find((h) => h === Han.After_a_Kan)) {
            playerStats[hule.seat!].calls.kans.rinshan++;
          }
          break;
        }

        let chankan = false;
        rounds.push({
          round: round!,
          rons: recordHule.hules?.map((hule) => {
            const agariInfo = getAgariRecord(record, hule, round!);
            if (agariInfo.han?.find((h) => h === Han.Robbing_a_Kan)) {
              chankan = true;
            }

            return {
              ...agariInfo,
              loser: losingSeat!,
            };
          }),
          playerStats,
        });

        if (chankan) {
          playerStats[losingSeat!].calls.kans.shouminkanRobbed++;
        }

        break;
      }
    }
  }

  const players = game.head?.result.players.sort(
    (a: { seat: number }, b: { seat: number }) => a.seat - b.seat
  );

  return {
    _id: undefined,
    contestId: undefined,
    version: latestGameResultVersion,
    config: {
      aiLevel: game.head?.config.mode.detail_rule.ai_level,
      riichiStickValue: game.head?.config.mode.detail_rule.liqibang_value,
    },
    contestMajsoulId: game.head?.config
      ? game.head?.config.meta
        ? game.head?.config.meta.contest_uid
        : null
      : null,
    majsoulId: game.head?.uuid,
    start_time: game.head?.start_time ?? 0 * 1000,
    end_time: game.head?.end_time ?? 0 * 1000,
    players: players.map((playerItem: { seat: number | undefined }) => {
      const account = game.head?.accounts?.find(
        (a) => a.seat === playerItem.seat
      );
      if (!account) {
        return null;
      }
      return {
        _id: null,
        nickname: account.nickname,
        majsoulId: account.account_id,
      };
    }),
    finalScore: players.map(
      (playerItem: { part_point_1: any; total_point: any }) => ({
        score: playerItem.part_point_1,
        uma: playerItem.total_point,
      })
    ),
    rounds,
  };
}
