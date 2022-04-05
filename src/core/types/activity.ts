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
  txParams: TxParams;
}

export type TxParams = {
  from: string; // '0x0000000000000000000000000000000000000000' - must match user's active address.
  to: string; // '0x0000000000000000000000000000000000000000' - Required except during contract publications.
  // chainId?: string; // '0x3' - Used to prevent transaction reuse across blockchains.
  nonce?: string; // '0x00' - ignored
  gasPrice?: string; // '0x09184e72a000' - customizable by user during confirmation.
  value?: string; // '0x00' - Only required to send ether to the recipient from the initiating external account.
  data?: string; // '0x00' - Optional, but used for defining smart contract creation and interaction.
  gas?: string; // '0x2710' - customizable by user during confirmation.
  gasLimit?: string; // '0x2710' - gas alias
};
