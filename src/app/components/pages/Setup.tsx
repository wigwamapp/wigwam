import { FC, Suspense } from "react";

import { AllSteps, StepsProvider } from "lib/react-hooks/useSteps";
import { WalletStep } from "app/defaults";

import BoardingPageLayout from "../layouts/BoardingPageLayout";
import LanguageStep from "../blocks/walletSteps/ChooseLanguage";
import ChooseAddAccountWay from "../blocks/walletSteps/ChooseAddAccountWay";
import AddSeedPhrase from "../blocks/walletSteps/AddSeedPhrase";
import VerifySeedPhrase from "../blocks/walletSteps/VerifySeedPhrase";
import AddHDAccounts from "../blocks/walletSteps/AddHDAccounts";
import AddByPrivateKeyAccount from "../blocks/walletSteps/AddByPrivateKeyAccount";
import AddLedgerAccounts from "../blocks/walletSteps/AddLedgerAccounts";
import AddOpenLoginAccount from "../blocks/walletSteps/AddOpenLoginAccount";
import SetupPassword from "../blocks/walletSteps/SetupPassword";

const STEPS: AllSteps<WalletStep> = [
  [WalletStep.ChooseLanguage, () => <LanguageStep />],
  [WalletStep.ChooseAddAccountWay, () => <ChooseAddAccountWay />],
  [WalletStep.CreateSeedPhrase, () => <AddSeedPhrase initialSetup />],
  [
    WalletStep.ImportSeedPhrase,
    () => <AddSeedPhrase initialSetup importExisting />,
  ],
  [WalletStep.VerifySeedPhrase, () => <VerifySeedPhrase initialSetup />],
  [WalletStep.AddHDAccounts, () => <AddHDAccounts initialSetup />],
  [WalletStep.AddByPrivateKeyAccount, () => <AddByPrivateKeyAccount />],
  [WalletStep.AddLedgerAccounts, () => <AddLedgerAccounts initialSetup />],
  [WalletStep.AddOpenLoginAccount, () => <AddOpenLoginAccount />],
  [WalletStep.SetupPassword, () => <SetupPassword />],
];

const Setup: FC = () => (
  <StepsProvider
    namespace="setup"
    steps={STEPS}
    fallback={WalletStep.ChooseLanguage}
  >
    {({ children }) => (
      <BoardingPageLayout title={null}>
        <div className="mb-24">
          <Suspense fallback={null}>
            <div className="mt-12">{children}</div>
          </Suspense>
        </div>
      </BoardingPageLayout>
    )}
  </StepsProvider>
);

export default Setup;
