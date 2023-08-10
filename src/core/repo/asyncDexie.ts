import Dexie from "dexie";

export class AsyncDexie extends Dexie {
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
        .catch(rej),
    );
  }
}
