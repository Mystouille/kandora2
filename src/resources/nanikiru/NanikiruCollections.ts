export type NanikiruProblem = {
  round: string;
  seat: string;
  turn: string;
  dora: string;
  hand: string;
  answer: string;
  explanation: string;
  ukeire: string;
  source: string;
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
  static #instance: NanikiruCollections;

  private collections: Collections;

  private constructor() {
    this.collections = {
      uzaku300Collection: { problems: [], remainingProblems: [] },
      uzaku301Collection: { problems: [], remainingProblems: [] },
      uzakuKinCollection: { problems: [], remainingProblems: [] },
      customCollection: { problems: [], remainingProblems: [] },
    };
  }

  private resetCollection() {
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
  /**
   * The static getter that controls access to the singleton instance.
   *
   * This implementation allows you to extend the Singleton class while
   * keeping just one instance of each subclass around.
   */
  public static get instance(): NanikiruCollections {
    if (!NanikiruCollections.#instance) {
      NanikiruCollections.#instance = new NanikiruCollections();
    }
    return NanikiruCollections.#instance;
  }

  public setCollection(collection: NanikiruProblem[]) {
    this.resetCollection();
    collection.forEach((prob) => {
      const type = prob.source.split("-")[0] as NanikiruType;
      const collection = this.getCollectionFromSource(type);
      collection.problems.push(prob);
      collection.remainingProblems.push(prob);
    });
  }

  public getNextproblems(type: NanikiruType): NanikiruProblem[] {
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
}
