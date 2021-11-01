import { RpcReply } from "./rpc";

export enum ActivityType {
  AppConnection = "APP_CONNECTION",
  Transaction = "TRANSACTION",
  Signing = "SIGNING",
}

export type ActivitySource =
  | {
      type: "self";
      kind: string;
    }
  | {
      type: "dapp";
      origin: string;
    };

export type ForApproval = TxForApproval;

export interface ForApprovalBase {
  type: ActivityType;
  source: ActivitySource;
  rpcReply: RpcReply;
}

export interface TxForApproval extends ForApprovalBase {
  type: ActivityType.Transaction;
  chainId: number;
  txParams: any;
}
