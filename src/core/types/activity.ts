import type { ethers } from "ethers";

import { RpcReply } from "./rpc";
import { Permission } from "./permissions";

export enum ActivityType {
  Connection = "CONNECTION",
  Transaction = "TRANSACTION",
  Signing = "SIGNING",
  AddNetwork = "ADD_NETWORK",
  AddToken = "ADD_TOKEN",
}

export enum SigningStandard {
  EthSign = "eth_sign",
  PersonalSign = "personal_sign",
  SignTypedDataV1 = "signTypedData_v1",
  SignTypedDataV3 = "signTypedData_v3",
  SignTypedDataV4 = "signTypedData_v4",
}

export enum SelfActivityKind {
  Transfer,
  Swap,
  Unknown,
}

export type ActivitySource =
  | {
      type: "self";
      kind: SelfActivityKind;
    }
  | {
      type: "page";
      url: string;
      permission?: Permission;
      tabId?: number;
      favIconUrl?: string;
    };

export interface ApprovalResult {
  approved: boolean;
  rawTx?: string;
  signedRawTx?: string;
  signedMessage?: string;
  accountAddresses?: string[];
  overriddenChainId?: number;
}

export type Approval =
  | TransactionApproval
  | SigningApproval
  | ConnectionApproval;

export type Activity =
  | TransactionActivity
  | SigningActivity
  | ConnectionActivity;

export interface ActivityBase {
  id: string;
  type: ActivityType;
  source: ActivitySource;
  timeAt: number;
  rpcReply?: RpcReply; // only exists on approval & on back side
}

export interface TransactionApproval extends ActivityBase {
  type: ActivityType.Transaction;
  chainId: number;
  accountAddress: string;
  txParams: TxParams;
}

export interface TransactionActivity extends TransactionApproval {
  rawTx: string;
  txHash: string;
  result?: any;
}

export interface SigningApproval extends ActivityBase {
  type: ActivityType.Signing;
  standard: SigningStandard;
  accountAddress: string;
  message: any;
}

export type SigningActivity = SigningApproval; // There are no additional fields

export interface ConnectionApproval extends ActivityBase {
  type: ActivityType.Connection;
  returnSelectedAccount: boolean; // For legacy eth_requestAccounts
  preferredChainId?: number;
}

export interface ConnectionActivity extends ConnectionApproval {
  accountAddresses: string[];
}

export type TxParams = {
  from: string; // '0x0000000000000000000000000000000000000000' - must match user's active address.
  to?: string; // '0x0000000000000000000000000000000000000000' - Required except during contract publications.
  // chainId?: string; // '0x3' - Used to prevent transaction reuse across blockchains.
  nonce?: string; // '0x00' - ignored
  gasPrice?: string; // '0x09184e72a000' - customizable by user during confirmation.
  value?: string; // '0x00' - Only required to send ether to the recipient from the initiating external account.
  data?: string; // '0x00' - Optional, but used for defining smart contract creation and interaction.
  // gas?: string; // '0x2710' - customizable by user during confirmation.
  gasLimit?: string; // '0x2710' - gas alias
  chainId?: string;
  // eip2930
  type?: string;
  accessList?: ethers.utils.AccessList;
  // eip1559
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
};

export enum TxActionType {
  TokenTransfer = "TOKEN_TRANSFER",
  TokenApprove = "TOKEN_APPROVE",
  ContractInteraction = "CONTRACT_INTERACTION",
  ContractDeployment = "CONTRACT_DEPLOYMENT",
}

export type TxAction =
  | TokenTransferAction
  | TokenApproveAction
  | ContractInteractionAction
  | ContractDeploymentAction;

export interface TokenTransferAction {
  type: TxActionType.TokenTransfer;
  toAddress: string;
  tokens: {
    slug: string;
    amount: string;
  }[];
  fromAddress?: string;
  data?: string;
}

export interface TokenApproveAction {
  type: TxActionType.TokenApprove;
  toAddress?: string;
  tokenSlug?: string;
  allTokensContract?: string;
  amount?: string;
  clears?: boolean;
}

export interface ContractInteractionAction {
  type: TxActionType.ContractInteraction;
  contractAddress: string;
  nativeTokenAmount?: string;
  method?: string;
  args?: any[];
}

export interface ContractDeploymentAction {
  type: TxActionType.ContractDeployment;
}

export type TokenActivityType = "transfer" | "approve";

export interface TokenActivityBase {
  chainId: number;
  accountAddress: string;
  tokenSlug: string;
  txHash: string;
  timeAt: number;
  type: TokenActivityType;
}

export type TokenActivity = TransferTokenActivity | ApproveTokenActivity;

export interface TransferTokenActivity extends TokenActivityBase {
  type: "transfer";
  anotherAddress: string;
  amount: string;
}

export interface ApproveTokenActivity extends TokenActivityBase {
  type: "approve";
  anotherAddress: string;
  amount?: string;
  clears?: boolean;
}
