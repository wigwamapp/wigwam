import { FC } from "react";
import { useAtom } from "jotai";

import { web3MetaMaskCompatibleAtom } from "app/atoms";

import Switcher from "app/components/elements/Switcher";
import SettingsHeader from "app/components/elements/SettingsHeader";

const Web3: FC = () => {
  const [metamaskMode, setMetamaskMode] = useAtom(web3MetaMaskCompatibleAtom);

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader>Web3 configurations</SettingsHeader>
      <Switcher
        id="web3_metamask_compatible"
        label="MetaMask Compatible Mode"
        text={metamaskMode ? "Enabled" : "Disabled"}
        checked={metamaskMode}
        onCheckedChange={setMetamaskMode}
        className="min-w-[17.75rem]"
      />
    </div>
  );
};

export default Web3;
