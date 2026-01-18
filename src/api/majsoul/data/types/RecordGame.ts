import * as lq from "./liqi";
import { RecordGameGameEndResult } from "./RecordGameGameEndResult";

export interface RecordGame {
  uuid?: string;
  start_time?: number;
  end_time?: number;
  config?: unknown;
  accounts?: lq.RecordGameAccountInfo[];
  result?: RecordGameGameEndResult;
}
