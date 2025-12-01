import { JWT } from "google-auth-library";
import * as token from "../../../token.json";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { config } from "../../config";

export type NanikiruProblem = {
  id: number;
  round: string;
  seat: string;
  turn: string;
  dora: string;
  hand: string;
  answer: string;
  explanation: string;
  ukeire: string;
  source: string;
  context: string | undefined;
  options: string | undefined;
  hint: string | undefined;
};

export enum NanikiruType {
  Uzaku300 = "300",
  Uzaku301 = "301",
  UzakuKin = "KIN",
  Undefined = "Undefined",
}

const pageSizes = {
  [NanikiruType.Uzaku300]: 3,
  [NanikiruType.Uzaku301]: 3,
  [NanikiruType.UzakuKin]: 2,
  [NanikiruType.Undefined]: 1,
};

type Collection = {
  remainingProblems: NanikiruProblem[];
  problems: NanikiruProblem[];
};

type Collections = {
  uzaku300Collection: Collection;
  uzaku301Collection: Collection;
  uzakuKinCollection: Collection;
  customCollection: Collection;
};

export class NanikiruCollections {
  static #instance: NanikiruCollections = new NanikiruCollections();

  private collections: Collections;
  private currentProblems: NanikiruProblem[];
  private currentType: NanikiruType | undefined;
  private serviceAccountAuth = new JWT({
    email: token.client_email,
    key: token.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  private doc: GoogleSpreadsheet;

  private constructor() {
    this.serviceAccountAuth = new JWT({
      email: token.client_email,
      key: token.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.doc = new GoogleSpreadsheet(
      config.NANIKIRU_SHEET_ID,
      this.serviceAccountAuth
    );
    this.collections = {
      uzaku300Collection: { problems: [], remainingProblems: [] },
      uzaku301Collection: { problems: [], remainingProblems: [] },
      uzakuKinCollection: { problems: [], remainingProblems: [] },
      customCollection: { problems: [], remainingProblems: [] },
    };
    this.currentProblems = [];
    this.fetchAllProblems().then((problems) => {
      this.setCollections(problems);
      console.log(
        `Nanikiru problems loaded. Total: ${problems.length} problems.`
      );
    });
  }

  private resetCollections() {
    this.collections = {
      uzaku300Collection: { problems: [], remainingProblems: [] },
      uzaku301Collection: { problems: [], remainingProblems: [] },
      uzakuKinCollection: { problems: [], remainingProblems: [] },
      customCollection: { problems: [], remainingProblems: [] },
    };
  }

  private getCollectionFromSource(type: NanikiruType) {
    switch (type) {
      case NanikiruType.Uzaku300:
        return this.collections.customCollection;
      case NanikiruType.Uzaku301:
        return this.collections.uzaku301Collection;
      case NanikiruType.UzakuKin:
        return this.collections.uzakuKinCollection;
      default:
        return this.collections.customCollection;
    }
  }

  public static get instance(): NanikiruCollections {
    if (!NanikiruCollections.#instance) {
      NanikiruCollections.#instance = new NanikiruCollections();
    }
    return NanikiruCollections.#instance;
  }

  private setCollections(collection: NanikiruProblem[]) {
    this.resetCollections();
    collection.forEach((prob) => {
      if (prob.source === undefined) {
        return;
      }
      const type = prob.source.split("-")[0] as NanikiruType;
      const collection = this.getCollectionFromSource(type);
      collection.problems.push(prob);
      collection.remainingProblems.push(prob);
    });
  }

  private getNextProblems(type: NanikiruType): NanikiruProblem[] {
    const pageSize = pageSizes[type];
    const collection = this.getCollectionFromSource(type);
    const remainingProb = collection.remainingProblems;
    if (remainingProb.length === 0) {
      collection.remainingProblems = collection.problems.slice(0);
    }
    let startIdx = Math.floor(Math.random() * remainingProb.length);
    startIdx -= startIdx % pageSize;
    return remainingProb.splice(
      startIdx,
      Math.max(startIdx + pageSize, remainingProb.length - 1)
    );
  }

  public getNextProblem(type: NanikiruType): NanikiruProblem {
    let problem = this.currentProblems.pop();
    if (problem === undefined || this.currentType !== type) {
      this.currentType = type;
      this.currentProblems = this.getNextProblems(type);
      this.currentProblems.reverse();
      problem = this.currentProblems.pop();
    }
    return this.collections.uzaku301Collection.problems[
      this.collections.uzaku301Collection.problems.length - 1
    ];
  }

  public async getProblemFromRowId(
    id: number
  ): Promise<NanikiruProblem | null> {
    if (id <= 1) {
      return null;
    }
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[0];
    return sheet.getRows().then((rows) => {
      const row = rows[id - 2];
      if (row) {
        const problem: NanikiruProblem = {
          id: row.rowNumber,
          round: row.get("round"),
          seat: row.get("seat"),
          turn: row.get("turn"),
          dora: row.get("dora"),
          hand: row.get("hand"),
          context: row.get("context"),
          options: row.get("options"),
          hint: row.get("hint"),
          answer: row.get("answer"),
          explanation: row.get("explanation"),
          ukeire: row.get("ukeire"),
          source: row.get("source"),
        };
        return problem;
      }
      return null;
    });
  }

  private async fetchAllProblems() {
    const nanikiruProblems: NanikiruProblem[] = [];
    return this.doc
      .loadInfo()
      .then(() => this.doc.sheetsByIndex[0].getRows())
      .then((rows) => {
        rows.forEach((row) => {
          const problem: NanikiruProblem = {
            id: row.rowNumber,
            round: row.get("round"),
            seat: row.get("seat"),
            turn: row.get("turn"),
            dora: row.get("dora"),
            hand: row.get("hand"),
            answer: row.get("answer"),
            explanation: row.get("explanation"),
            ukeire: row.get("ukeire"),
            source: row.get("source"),
            context: row.get("context"),
            options: row.get("options"),
            hint: row.get("hint"),
          };
          nanikiruProblems.push(problem);
        });
        return nanikiruProblems.filter(
          (p) => p.hand !== undefined && p.answer !== undefined
        );
      });
  }
}
