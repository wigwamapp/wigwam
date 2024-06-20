import { WalletStatus, SeedPharse } from "./base";
import { AddAccountParams, Account } from "./account";
import { RpcResponse } from "./rpc";
import { ActivitySource, Approval, ApprovalResult } from "./activity";
import { SyncStatus } from "./sync";
import { TokenType } from "./tokens";
import { GasPrices } from "./fees";
import { RampTokenInfo } from "./ramp";

export type Request =
  | GetWalletStateRequest
  | SetupWalletRequest
  | UnlockWalletRequest
  | LockWalletRequest
  | ChangePasswordRequest
  | GetAccountsRequest
  | AddAccountsRequest
  | DeleteAccountsRequest
  | UpdateAccountNameRequest
  | GetSeedPhraseRequest
  | GetPrivateKeyRequest
  | GetPublicKeyRequest
  | GetNeuterExtendedKeyRequest
  | SendRpcRequest
  | GetApprovalsRequest
  | ApproveRequest
  | GetGasPricesRequest
  | GetSyncStatusRequest
  | GetOnRampCurrenciesRequest
  | GetTokenDetailsUrlRequest;

export type Response =
  | GetWalletStateResponse
  | SetupWalletResponse
  | UnlockWalletResponse
  | LockWalletResponse
  | ChangePasswordResponse
  | GetAccountsResponse
  | AddAccountsResponse
  | DeleteAccountsResponse
  | UpdateAccountNameResponse
  | GetSeedPhraseResponse
  | GetPrivateKeyResponse
  | GetPublicKeyResponse
  | GetNeuterExtendedKeyResponse
  | GetGasPricesResponse
  | GetSyncStatusResponse
  | SendRpcResponse
  | GetApprovalsResponse
  | ApproveResponse
  | GetOnRampCurrenciesResponse
  | GetTokenDetailsUrlResponse;

export type EventMessage =
  | WalletStateUpdated
  | AccountsUpdated
  | ApprovalsUpdated
  | Sync
  | FindToken
  | SyncTokenActivities
  | SyncStatusUpdated
  | RejectAllApprovals;

export enum MessageType {
  GetWalletState = "GET_WALLET_STATE",
  WalletStateUpdated = "WALLET_STATE_UPDATED",
  SetupWallet = "SETUP_WALLET",
  UnlockWallet = "UNLOCK_WALLET",
  LockWallet = "LOCK_WALLET",
  ChangePassword = "CHANGE_PASSWORD",
  GetAccounts = "GET_ACCOUNTS",
  AddAccounts = "ADD_ACCOUNTS",
  DeleteAccounts = "DELETE_ACCOUNTS",
  UpdateAccountName = "UPDATE_ACCOUNT_NAME",
  AccountsUpdated = "ACCOUNTS_UPDATED",
  GetSeedPhrase = "GET_SEED_PHRASE",
  GetPrivateKey = "GET_PRIVATE_KEY",
  GetPublicKey = "GET_PUBLIC_KEY",
  GetNeuterExtendedKey = "GET_NEUTER_EXTENDED_KEY",
  Sync = "SYNC",
  FindToken = "FIND_TOKEN",
  SyncTokenActivities = "SYNC_TOKEN_ACTIVITIES",
  GetGasPrices = "GET_GAS_PRICES",
  GetSyncStatus = "GET_SYNC_STATUS",
  SyncStatusUpdated = "SYNC_STATUS_UPDATED",
  SendRpc = "SEND_RPC",
  GetApprovals = "GET_APPROVALS",
  ApprovalsUpdated = "APPROVALS_UPDATED",
  Approve = "APPROVE",
  RejectAllApprovals = "REJECT_ALL_APPROVALS",
  GetOnRampCurrencies = "GET_ONRAMP_CURRENCIES",
  GetTokenDetailsUrl = "GET_TOKEN_DETAILS_URL",
}

export interface MessageBase {
  type: MessageType;
}

export interface GetWalletStateRequest extends MessageBase {
  type: MessageType.GetWalletState;
}

export interface GetWalletStateResponse extends MessageBase {
  type: MessageType.GetWalletState;
  walletStatus: WalletStatus;
  hasSeedPhrase: boolean;
}

export interface WalletStateUpdated extends MessageBase {
  type: MessageType.WalletStateUpdated;
  walletStatus: WalletStatus;
  hasSeedPhrase: boolean;
}

export interface SetupWalletRequest extends MessageBase {
  type: MessageType.SetupWallet;
  password: string;
  accountsParams: AddAccountParams[];
  seedPhrase?: SeedPharse;
}

export interface SetupWalletResponse extends MessageBase {
  type: MessageType.SetupWallet;
}

export interface UnlockWalletRequest extends MessageBase {
  type: MessageType.UnlockWallet;
  password: string;
}

export interface UnlockWalletResponse extends MessageBase {
  type: MessageType.UnlockWallet;
}

export interface LockWalletRequest extends MessageBase {
  type: MessageType.LockWallet;
}

export interface LockWalletResponse extends MessageBase {
  type: MessageType.LockWallet;
}

export interface ChangePasswordRequest extends MessageBase {
  type: MessageType.ChangePassword;
  currentPassword: string;
  nextPassword: string;
}

export interface ChangePasswordResponse extends MessageBase {
  type: MessageType.ChangePassword;
}

export interface GetAccountsRequest extends MessageBase {
  type: MessageType.GetAccounts;
}

export interface GetAccountsResponse extends MessageBase {
  type: MessageType.GetAccounts;
  accounts: Account[];
}

export interface AddAccountsRequest extends MessageBase {
  type: MessageType.AddAccounts;
  accountsParams: AddAccountParams[];
  seedPhrase?: SeedPharse;
}

export interface AddAccountsResponse extends MessageBase {
  type: MessageType.AddAccounts;
}

export interface DeleteAccountsRequest extends MessageBase {
  type: MessageType.DeleteAccounts;
  password: string;
  accountUuids: string[];
}

export interface DeleteAccountsResponse extends MessageBase {
  type: MessageType.DeleteAccounts;
}

export interface UpdateAccountNameRequest extends MessageBase {
  type: MessageType.UpdateAccountName;
  accountUuid: string;
  name: string;
}

export interface UpdateAccountNameResponse extends MessageBase {
  type: MessageType.UpdateAccountName;
}

export interface AccountsUpdated extends MessageBase {
  type: MessageType.AccountsUpdated;
  accounts: Account[];
}

export interface GetSeedPhraseRequest extends MessageBase {
  type: MessageType.GetSeedPhrase;
  password: string;
}

export interface GetSeedPhraseResponse extends MessageBase {
  type: MessageType.GetSeedPhrase;
  seedPhrase: SeedPharse;
}

export interface GetPrivateKeyRequest extends MessageBase {
  type: MessageType.GetPrivateKey;
  password: string;
  accountUuid: string;
}

export interface GetPrivateKeyResponse extends MessageBase {
  type: MessageType.GetPrivateKey;
  privateKey: string;
}

export interface GetPublicKeyRequest extends MessageBase {
  type: MessageType.GetPublicKey;
  accountUuid: string;
}

export interface GetPublicKeyResponse extends MessageBase {
  type: MessageType.GetPublicKey;
  publicKey: string;
}

export interface GetNeuterExtendedKeyRequest extends MessageBase {
  type: MessageType.GetNeuterExtendedKey;
  derivationPath: string;
}

export interface GetNeuterExtendedKeyResponse extends MessageBase {
  type: MessageType.GetNeuterExtendedKey;
  extendedKey: string;
}

export interface Sync extends MessageBase {
  type: MessageType.Sync;
  chainId: number;
  accountAddress: string;
  tokenType: TokenType;
}

export interface FindToken extends MessageBase {
  type: MessageType.FindToken;
  chainId: number;
  accountAddress: string;
  tokenSlug: string;
  refreshMetadata?: boolean;
}

export interface SyncTokenActivities extends MessageBase {
  type: MessageType.SyncTokenActivities;
  chainId: number;
  accountAddress: string;
  tokenSlug: string;
}

export interface GetGasPricesRequest extends MessageBase {
  type: MessageType.GetGasPrices;
  chainId: number;
}

export interface GetGasPricesResponse extends MessageBase {
  type: MessageType.GetGasPrices;
  gasPrices: GasPrices;
}

export interface GetSyncStatusRequest extends MessageBase {
  type: MessageType.GetSyncStatus;
}

export interface GetSyncStatusResponse extends MessageBase {
  type: MessageType.GetSyncStatus;
  status: SyncStatus;
}

export interface SyncStatusUpdated extends MessageBase {
  type: MessageType.SyncStatusUpdated;
  status: SyncStatus;
}

export interface SendRpcRequest extends MessageBase {
  type: MessageType.SendRpc;
  chainId: number;
  method: string;
  params: any[];
  source?: ActivitySource;
}

export interface SendRpcResponse extends MessageBase {
  type: MessageType.SendRpc;
  response: RpcResponse;
}

export interface GetApprovalsRequest extends MessageBase {
  type: MessageType.GetApprovals;
}

export interface GetApprovalsResponse extends MessageBase {
  type: MessageType.GetApprovals;
  approvals: Approval[];
}

export interface ApprovalsUpdated extends MessageBase {
  type: MessageType.ApprovalsUpdated;
  approvals: Approval[];
}

export interface ApproveRequest extends MessageBase {
  type: MessageType.Approve;
  approvalId: string;
  result: ApprovalResult;
}

export interface ApproveResponse extends MessageBase {
  type: MessageType.Approve;
}

export interface RejectAllApprovals extends MessageBase {
  type: MessageType.RejectAllApprovals;
}

export interface GetOnRampCurrenciesRequest extends MessageBase {
  type: MessageType.GetOnRampCurrencies;
}

export interface GetOnRampCurrenciesResponse extends MessageBase {
  type: MessageType.GetOnRampCurrencies;
  currencies: Record<string, RampTokenInfo>;
}

export interface GetTokenDetailsUrlRequest extends MessageBase {
  type: MessageType.GetTokenDetailsUrl;
  chainId: number;
  tokenSlug: string;
}

export interface GetTokenDetailsUrlResponse extends MessageBase {
  type: MessageType.GetTokenDetailsUrl;
  detailsUrl: string | null;
}
