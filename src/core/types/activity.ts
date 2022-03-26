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

export type Approval = TransactionApproval;

export interface ApprovalBase {
  id: string;
  type: ActivityType;
  source: ActivitySource;
  rpcReply: RpcReply;
}

export interface TransactionApproval extends ApprovalBase {
  type: ActivityType.Transaction;
  chainId: number;
  accountAddress: string;
  txParams: any;
}
