import { ethers } from "ethers";
import { RpcReply } from "./rpc";

export enum ActivityType {
  Connection = "CONNECTION",
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

export interface ApprovalResult {
  approved: boolean;
  rawTx?: string;
  signedRawTx?: string;
  signedMessage?: string;
  accountAddresses?: string[];
}

export type Approval =
  | TransactionApproval
  | SigningApproval
  | ConnectionApproval;

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

export interface SigningApproval extends ApprovalBase {
  type: ActivityType.Signing;
  message: string;
}

export interface ConnectionApproval extends ApprovalBase {
  type: ActivityType.Connection;
  origin: string;
  favIconUrl: string;
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
  chainId?: string;
  // eip2930
  type?: string;
  accessList?: ethers.utils.AccessList;
  // eip1559
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
};
