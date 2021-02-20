import Dexie from "dexie";

export enum Table {
  Tokens = "tokens",
}

export const db = new Dexie("TakyDatabase");
db.version(1).stores({
  [Table.Tokens]: "++id, decimals, symbol, name",
});

export const wslpTokens = db.table<IToken, number>(Table.Tokens);

export interface IToken {
  id?: number;
  decimals: number;
  symbol: string;
  name: string;
}
