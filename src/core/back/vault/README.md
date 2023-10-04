# Vault

Powered by [KDBX - KeePass v2 database](https://github.com/keeweb/kdbxweb). A battle-tested core used by password managers.

## Introduction

The `Vault` class is a critical component of the app. It is responsible for managing a password-protected vault that stores sensitive data, including seed phrases, accounts, and their associated keys. This documentation provides an in-depth overview of the `Vault` class, its methods, and its role within the extension.

## Overview

The `Vault` class is responsible for the following tasks:

- Setting up a vault by creating a new key file, generating a KDBX database, adding seed phrases and accounts, encrypting and saving the data, and persisting the password hash to a secure session.

- Unlocking the vault by validating the password hash, loading the encrypted data, and creating a new `Vault` instance for further interactions.

- Managing seed phrases, accounts, and their associated keys within the vault, including adding, deleting, updating, and retrieving these entities.

- Handling password changes securely, ensuring the vault's continued protection.

- Signing transactions and messages using private keys stored in the vault.

- Ensuring the security of sensitive data, including encryption, decryption, and secure storage.

## Methods and Functionality

### `isExist()`

- Checks if a vault already exists in storage.

### `setup(passwordHash: string, accountsParams: AddAccountParams[], seedPhrase?: SeedPhrase)`

- Sets up a new vault by creating a key file, generating a KDBX database, adding seed phrases and accounts, encrypting and saving the data, and persisting the password hash.

### `unlock(passwordHash: string)`

- Unlocks an existing vault by validating the password hash, loading the encrypted data, and creating a new `Vault` instance.

### Account Management

- `addAccounts(accountParams: AddAccountParams[], seedPhrase?: SeedPhrase)`
- `deleteAccounts(passwordHash: string, accUuids: string[])`
- `updateAccountName(accUuid: string, name: string)`
- `getAccounts()`

### Seed Phrase Management

- `getSeedPhrase(passwordHash: string)`
- `getNeuterExtendedKey(derivationPath: string)`
- `addSeedPhraseForce(seedPhrase: SeedPhrase)`

### Account Key Management

- `getPublicKey(accUuid: string)`
- `sign(accUuid: string, digest: string)`
- `signMessage(accUuid: string, standard: SigningStandard, data: any)`
- `getPrivateKey(passwordHash: string, accUuid: string)`

### Other Utility Methods

- `cleanup()`: Cleans up the vault, removing sensitive data and the password hash from the session.

- `changePassword(currentHash: string, nextHash: string)`: Changes the vault's password.

## Security and Isolation

The `Vault` class prioritizes security and isolation:

- Sensitive operations, such as private key management and password validation, are performed securely.

- User data and private keys are encrypted and stored securely.

- Permission requests are limited to only essential functionalities.
