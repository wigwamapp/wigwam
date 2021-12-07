import Dexie from "dexie";

import { underProfile } from "lib/ext/profile";

import { RepoTable } from "./types";

class MyDexie extends Dexie {
  constructor(private namePromise: Promise<string>) {
    super("<stub>");
  }

  open() {
    return new Dexie.Promise<Dexie>((res, rej) =>
      this.namePromise
        .then((name) => {
          Object.assign(this, { name });
        })
        .then(() => super.open())
        .then(res)
        .catch(rej)
    );
  }
}

export const db = new MyDexie(Promise.resolve(underProfile("main")));

/**
 * 1
 */

db.version(1).stores({
  [RepoTable.Networks]: "&chainId,type,chainTag",
  [RepoTable.Accounts]: "&address,type,source",
});

db.version(2)
  .stores({
    [RepoTable.Accounts]: "&address,type",
  })
  .upgrade(async (tx) => {
    await tx
      .table(RepoTable.Accounts)
      .toCollection()
      .modify((acc) => {
        delete acc.source;
      });
  });
