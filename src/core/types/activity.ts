import type { ethers } from "ethers";

import { RpcContext } from "./rpc";
import { Permission } from "./permissions";
import type { Route } from "@lifi/types";

export enum ActivityType {
  Connection = "CONNECTION",
  Transaction = "TRANSACTION",
  Signing = "SIGNING",
  AddNetwork = "ADD_NETWORK",
  AddToken = "ADD_TOKEN",
  Ramp = "RAMP",
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
  Reward,
}

export type ReplaceTxType = "speedup" | "cancel";

export type ReplaceTx = {
  type: ReplaceTxType;
  prevActivityId: string;
  prevTxHash: string;
  prevTxGasPrice?: string;
  prevTimeAt: number;
  prevReplaceTxType?: ReplaceTxType;
};

export type ActivitySource =
  | {
      type: "self";
      kind: SelfActivityKind;
      swapMeta?: Route;
      replaceTx?: ReplaceTx;
    }
  | {
      type: "page";
      url: string;
      permission?: Permission;
      tabId?: number;
      favIconUrl?: string;
      replaceTx?: ReplaceTx;
    };

export interface ApprovalResult {
  approved: boolean;
  rawTx?: string;
  signature?: TxSignature;
  signedMessage?: string;
  accountAddresses?: string[];
  overriddenChainId?: number;
}

export type Approval =
  | TransactionApproval
  | SigningApproval
  | ConnectionApproval
  | AddNetworkApproval;

export type Activity =
  | TransactionActivity
  | SigningActivity
  | ConnectionActivity
  | RampActivity;

export interface ActivityBase {
  id: string;
  type: ActivityType;
  source: ActivitySource;
  timeAt: number;
  txAction?: TxAction;
  chainId?: number;
  rpcCtx?: RpcContext; // only exists on approval & on back side
}

export interface TransactionApproval extends ActivityBase {
  type: ActivityType.Transaction;
  chainId: number;
  accountAddress: string;
  txParams: TxParams;
}

export interface TransactionActivity extends TransactionApproval {
  pending: number;
  rawTx: string;
  txHash: string;
  txAction?: TxAction;
  result?: TxReceipt;
  gasTokenPriceUSD?: string;
}

export interface SigningApproval extends ActivityBase {
  type: ActivityType.Signing;
  standard: SigningStandard;
  accountAddress: string;
  message: any;
}

export interface RampActivity extends ActivityBase {
  partnerOrderId: string;
  pending: 0 | 1;
  type: ActivityType.Ramp;
  kind: "onramp" | "offramp";
  accountAddress: `0x${string}`;
  amountInCrypto: number;
  amountInFiat: number;
  amountInFiatUSD: number;
  totalFee: number;
  fiatCurrency: string;
  cryptoCurrency: string;
  network: string;
  status: OnRampTxStatus;
  statusReason: string;
  paymentType: string;
  tokenSlug: string;
  chainId: number;
  partner: "transak";
  partnerOrder: object;
  transactionHash?: string;
  withError?: boolean;
}

export interface SigningActivity extends SigningApproval {
  pending: number;
}

export interface ConnectionApproval extends ActivityBase {
  type: ActivityType.Connection;
  returnSelectedAccount: boolean; // For legacy eth_requestAccounts
  preferredChainId?: number;
}

export interface ConnectionActivity extends ConnectionApproval {
  pending: number;
  accountAddress: string;
}

export interface AddNetworkApproval extends ActivityBase {
  type: ActivityType.AddNetwork;
  chainId: number;
  networkParams: AddEthereumChainParameter;
}

export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[] | null;
  iconUrls?: string[] | null; // Currently ignored.
}

export type TxParams = {
  from: string; // '0x0000000000000000000000000000000000000000' - must match user's active address.
  to?: string; // '0x0000000000000000000000000000000000000000' - Required except during contract publications.
  // chainId?: string; // '0x3' - Used to prevent transaction reuse across blockchains.
  nonce?: string | number; // '0x00' - ignored
  gasPrice?: string; // '0x09184e72a000' - customizable by user during confirmation.
  value?: string; // '0x00' - Only required to send ether to the recipient from the initiating external account.
  data?: string; // '0x00' - Optional, but used for defining smart contract creation and interaction.
  // gas?: string; // '0x2710' - customizable by user during confirmation.
  gasLimit?: string; // '0x2710' - gas alias
  chainId?: string | number;
  // eip2930
  type?: string | number;
  accessList?: ethers.AccessList;
  // eip1559
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
};

export type TxSignature = {
  v: number;
  r: string;
  s: string;
};

export type TxReceipt = {
  blockHash: string;
  blockNumber: string;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  logs: any[];
  logsBloom: string;
  status: string;
  to: string | null;
  transactionHash: string;
  transactionIndex: string;
  type: string;
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
  toAddress: string;
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
  pending: number;
  timeAt: number;
  type: TokenActivityType;
  project?: TokenActivityProject;
  blockNumber?: number;
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

export type TokenActivityProject = {
  name: string;
  logoUrl?: string;
  siteUrl?: string;
};

export type OnRampTxStatus =
  | "AWAITING_PAYMENT_FROM_USER"
  | "PAYMENT_DONE_MARKED_BY_USER"
  | "PROCESSING"
  | "PENDING_DELIVERY_FROM_TRANSAK"
  | "ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED"
  | "EXPIRED";
