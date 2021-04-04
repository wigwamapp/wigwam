import { WalletStatus, SeedPharse } from "./base";
import { AddAccountParams } from "./addAccount";

export type Request =
  | GetWalletStatusRequest
  | SetupWalletRequest
  | UnlockWalletRequest
  | LockWalletRequest
  | HasSeedPhraseRequest
  | AddSeedPhraseRequest
  | AddAccountRequest
  | DeleteAccountRequest
  | GetSeedPhraseRequest
  | GetPrivateKeyRequest
  | GetPublicKeyRequest;

export type Response =
  | GetWalletStatusResponse
  | SetupWalletResponse
  | UnlockWalletResponse
  | LockWalletResponse
  | HasSeedPhraseResponse
  | AddSeedPhraseResponse
  | AddAccountResponse
  | DeleteAccountResponse
  | GetSeedPhraseResponse
  | GetPrivateKeyResponse
  | GetPublicKeyResponse;

export type EventMessage = WalletStatusUpdated;

export enum MessageType {
  GetWalletStatus = "GET_WALLET_STATUS",
  WalletStatusUpdated = "WALLET_STATUS_UPDATED",
  SetupWallet = "SETUP_WALLET",
  UnlockWallet = "UNLOCK_WALLET",
  LockWallet = "LOCK_WALLET",
  HasSeedPhrase = "HAS_SEED_PHRASE",
  AddSeedPhrase = "ADD_SEED_PHRASE",
  AddAccount = "ADD_ACCOUNT",
  DeleteAccount = "DELETE_ACCOUNT",
  GetSeedPhrase = "GET_SEED_PHRASE",
  GetPrivateKey = "GET_PRIVATE_KEY",
  GetPublicKey = "GET_PUBLIC_KEY",
}

export interface MessageBase {
  type: MessageType;
}

export interface GetWalletStatusRequest extends MessageBase {
  type: MessageType.GetWalletStatus;
}

export interface GetWalletStatusResponse extends MessageBase {
  type: MessageType.GetWalletStatus;
  status: WalletStatus;
}

export interface WalletStatusUpdated extends MessageBase {
  type: MessageType.WalletStatusUpdated;
  status: WalletStatus;
}

export interface SetupWalletRequest extends MessageBase {
  type: MessageType.SetupWallet;
  password: string;
  accountParams: AddAccountParams;
  seedPhrase?: SeedPharse;
}

export interface SetupWalletResponse extends MessageBase {
  type: MessageType.SetupWallet;
  accountAddress: string;
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

export interface HasSeedPhraseRequest extends MessageBase {
  type: MessageType.HasSeedPhrase;
}

export interface HasSeedPhraseResponse extends MessageBase {
  type: MessageType.HasSeedPhrase;
  seedPhraseExists: boolean;
}

export interface AddSeedPhraseRequest extends MessageBase {
  type: MessageType.AddSeedPhrase;
  seedPhrase: SeedPharse;
}

export interface AddSeedPhraseResponse extends MessageBase {
  type: MessageType.AddSeedPhrase;
}

export interface AddAccountRequest extends MessageBase {
  type: MessageType.AddAccount;
  params: AddAccountParams;
}

export interface AddAccountResponse extends MessageBase {
  type: MessageType.AddAccount;
  accountAddress: string;
}

export interface DeleteAccountRequest extends MessageBase {
  type: MessageType.DeleteAccount;
  password: string;
  accountAddress: string;
}

export interface DeleteAccountResponse extends MessageBase {
  type: MessageType.DeleteAccount;
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
  accountAddress: string;
}

export interface GetPrivateKeyResponse extends MessageBase {
  type: MessageType.GetPrivateKey;
  privateKey: string;
}

export interface GetPublicKeyRequest extends MessageBase {
  type: MessageType.GetPublicKey;
  accountAddress: string;
}

export interface GetPublicKeyResponse extends MessageBase {
  type: MessageType.GetPublicKey;
  publicKey: string;
}
