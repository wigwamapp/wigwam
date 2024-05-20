# Wigwam Web Extension Wallet - Security Guidelines

At Wigwam, we prioritize the security and privacy of our users' digital assets and personal information. This document outlines the security measures and features we have implemented to ensure a secure web3 wallet experience.

### 1. Encryption

[The `Vault`](../src/core/back/vault/README.md) is a critical component of the app. It is responsible for encryption sensitive data, including seed phrases, accounts, and their associated private keys. Powered by [KDBX - KeePass v2 database](https://github.com/keeweb/kdbxweb). A battle-tested core used by password managers.

- Primarily uses the Advanced Encryption Standard (AES) as the encryption algorithm. AES is a widely accepted and secure symmetric encryption algorithm. It is known for its resistance to various cryptographic attacks and is considered one of the most secure encryption standards available.

- Uses key derivation functions (KDFs) to derive encryption keys from the user's master password. The default KDF used is Argon2, a memory-hard function designed to thwart brute force and dictionary attacks. It's computationally intensive and ensures that attackers cannot easily guess the master password even if they have access to the encrypted data.

- Includes mechanisms to verify the integrity of the database file. Any unauthorized changes to the database are detected, preventing tampering.

- Each entry in the database file typically has a unique random salt. Salting is essential to prevent rainbow table attacks and ensures that identical passwords result in different encrypted values. This means that even if two entries have the same password, they will have different ciphertexts due to the unique salts.

### 2. Secure User Authentication

- Profiles - allow users to split their app usage experience into multiple different sessions, providing increased safety. For example, a user can have a work profile and a personal profile.

- Protection against brute force attacks: If the password is entered incorrectly some times in a row, the application will be locked for a few minutes.

- Users have the option to regain access to their wallets by using a Recovery Seed Phrase or private keys. To do this, they need to create a new profile or reinstall the application.

- Users also have the option to change their password if they think it is not secure enough or has been compromised.

### 3. Seed Phrase Management

- The seed phrase is securely stored on the user's device in encrypted form.

- When the seed phrase is stored in-memory, [obfuscation with a one-time salt](../src/app/components/screens/addAccountSteps/CreateSeedPhrase.tsx#L76) is applied.

- During the creation process, a [secure cryptographic random number generator](../src/app/components/screens/addAccountSteps/CreateSeedPhrase.tsx#L91) is used to generate the seed phrase.

- To import the existing phrase, contenteditable html elemnt is used, which also prevent browser cache issues.

- To display the entire phrase to the user, the web canvas is utilized, which helps avoid potential issues related to browser caching.

- When the entire phrase is displayed, the app monitors whether it is in focus and if the user interacts with it. If not, it conceals the phrase to prevent unauthorized viewing within the user interface.

- Users are provided with clear instructions emphasizing the importance of keeping their seed phrase offline and secure to prevent unauthorized access.

### 4. Password Management

- Only complex passwords are allowed for use.

- The password hash (sha256) is used as entropy for encryption, rather than the original password.

- When storing the password in memory, apply obfuscation with a one-time salt.

### 5. Hardware Wallet Integration

Our wallet extension supports hardware wallets like Ledger and Trezor, which offer enhanced security through hardware-based key storage and transaction signing.

### 6. Trusted accounts

With a "Contacts" feature - users can specify trusted and untrusted addresses to control incoming and outgoing transactions, providing them with greater control over their funds.

### 7. Transaction Confirmation

- Implements a clear and secure transaction confirmation process to prevent accidental or unauthorized transactions, ensuring that users have the final say in approving transactions.

- The architecture allows adding transactions for confirmation only from authorized decentralized applications.

- There is a queue for all transactions that doesn't block the user interface, allowing users to explore what they are specifically confirming.

### 8. Secure Communication

- All data transmission is conducted over HTTPS to secure user data in transit.

- Content security policies are implemented to mitigate the risk of cross-site scripting (XSS) attacks.

### 9. Permission System

Wigwam uses a permission system that restricts what websites and applications can access to the account addresses, ensuring that user data and actions remain secure.

### 10. Session Timeout

Wigwam implements session timeouts to automatically log out users after a period of inactivity, reducing the risk of unauthorized access.

### 11. Error Management

- Every error encapsulated with a common error message to prevent the detailed error stack from being exposed.

- In a production environment, all logging is disabled.

### 12. Regular Updates

- To address potential security vulnerabilities, Wigwam keeps the app updated with the latest security patches and enhancements.

- Fully adapted to the latest browser extension ManifestV3 API, ensuring compatibility with modern standards.

- Zero vulnerabilities in NPM dependencies.

### 13. Anti-Phishing Measures

- Wigwam implements anti-phishing protection to protect users about suspicious websites. Powered by [eth-phishing-detect](https://github.com/MetaMask/eth-phishing-detect).

- Wigwam uses unique profile avatars. This feature allows you to determine whether the Wigwam you are seeing is real or fake.

### 14. User Education

Within the extension, we provide educational resources to help users understand potential risks and best practices to stay safe in the Web3 ecosystem.

### 15. Data Minimization

Wigwam collects and stores only the minimum amount of user data necessary for the operation of the application UI, respecting user privacy.

### 16. Open Source Transparency

Wigwam is committed to transparency and is open source, allowing the community to review and contribute to security improvements.

### 17. Security Audits

#### 01/15/2024 Pentest Security Audit by [Halborn](https://halborn.com/)

**Report:** [Wigwam_Pentest_Report_Halborn_15_01_2024.pdf](../audit/Wigwam_Pentest_Report_Halborn_15_01_2024.pdf)

**Summary:** No critical issues were identified, but some security risks were found. Finally, all issues were successfully resolved.

### 18. User Support

Wigwam offers responsive customer support to assist users in case of security concerns or issues.

### 19. Regular Penetration Testing

Wigwam conducts regular penetration testing to proactively identify vulnerabilities before malicious actors can exploit them.

Security is an ongoing process, and we remain committed to continuously monitoring and updating Wigwam to stay ahead of potential risks and protect our users' assets and data.
