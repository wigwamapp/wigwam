import { WalletStatus, SeedPharse } from "./base";
import { AddAccountParams } from "./addAccount";

export type Request =
  | GetWalletStatusRequest
  | SetupWalletRequest
  | UnlockWalletRequest
  | LockWalletRequest
  | HasSeedPhraseRequest
  | AddSeedPhraseRequest
  | AddAccountsRequest
  | DeleteAccountsRequest
  | GetSeedPhraseRequest
  | GetPrivateKeyRequest
  | GetPublicKeyRequest
  | GetNeuterExtendedKeyRequest;

export type Response =
  | GetWalletStatusResponse
  | SetupWalletResponse
  | UnlockWalletResponse
  | LockWalletResponse
  | HasSeedPhraseResponse
  | AddSeedPhraseResponse
  | AddAccountsResponse
  | DeleteAccountsResponse
  | GetSeedPhraseResponse
  | GetPrivateKeyResponse
  | GetPublicKeyResponse
  | GetNeuterExtendedKeyResponse;

export type EventMessage = WalletStatusUpdated;

export enum MessageType {
  GetWalletStatus = "GET_WALLET_STATUS",
  WalletStatusUpdated = "WALLET_STATUS_UPDATED",
  SetupWallet = "SETUP_WALLET",
  UnlockWallet = "UNLOCK_WALLET",
  LockWallet = "LOCK_WALLET",
  HasSeedPhrase = "HAS_SEED_PHRASE",
  AddSeedPhrase = "ADD_SEED_PHRASE",
  AddAccounts = "ADD_ACCOUNTS",
  DeleteAccounts = "DELETE_ACCOUNTS",
  GetSeedPhrase = "GET_SEED_PHRASE",
  GetPrivateKey = "GET_PRIVATE_KEY",
  GetPublicKey = "GET_PUBLIC_KEY",
  GetNeuterExtendedKey = "GET_NEUTER_EXTENDED_KEY",
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
  accounts: AddAccountParams[];
  seedPhrase?: SeedPharse;
}

export interface SetupWalletResponse extends MessageBase {
  type: MessageType.SetupWallet;
  accountAddresses: string[];
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

export interface AddAccountsRequest extends MessageBase {
  type: MessageType.AddAccounts;
  accounts: AddAccountParams[];
}

export interface AddAccountsResponse extends MessageBase {
  type: MessageType.AddAccounts;
  accountAddresses: string[];
}

export interface DeleteAccountsRequest extends MessageBase {
  type: MessageType.DeleteAccounts;
  password: string;
  accountAddresses: string[];
}

export interface DeleteAccountsResponse extends MessageBase {
  type: MessageType.DeleteAccounts;
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

export interface GetNeuterExtendedKeyRequest extends MessageBase {
  type: MessageType.GetNeuterExtendedKey;
  derivationPath: string;
}

export interface GetNeuterExtendedKeyResponse extends MessageBase {
  type: MessageType.GetNeuterExtendedKey;
  extendedKey: string;
}
