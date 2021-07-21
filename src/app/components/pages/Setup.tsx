import { FC, Suspense } from "react";

import { AllSteps, StepsProvider } from "lib/react-steps";
import { WalletStep } from "app/defaults";

import BoardingPageLayout from "../layouts/BoardingPageLayout";
import LanguageStep from "../blocks/walletSteps/ChooseLanguage";
import ChooseAddAccountWay from "../blocks/walletSteps/ChooseAddAccountWay";
import AddSeedPhrase from "../blocks/walletSteps/AddSeedPhrase";
import VerifySeedPhrase from "../blocks/walletSteps/VerifySeedPhrase";
import AddHDAccount from "../blocks/walletSteps/AddHDAccount";
import AddByPrivateKeyAccount from "../blocks/walletSteps/AddByPrivateKeyAccount";
import AddLedgerAccount from "../blocks/walletSteps/AddLedgerAccount";
import AddTorusAccount from "../blocks/walletSteps/AddTorusAccount";
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
  [WalletStep.AddHDAccount, () => <AddHDAccount />],
  [WalletStep.AddByPrivateKeyAccount, () => <AddByPrivateKeyAccount />],
  [WalletStep.AddLedgerAccount, () => <AddLedgerAccount />],
  [WalletStep.AddTorusAccount, () => <AddTorusAccount />],
  [WalletStep.SetupPassword, () => <SetupPassword />],
];

const Setup: FC = () => (
  <StepsProvider
    namespace="setup"
    steps={STEPS}
    fallback={WalletStep.ChooseLanguage}
  >
    {({ stepId, children }) => (
      <BoardingPageLayout key={stepId} title={null}>
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
