import { FC, useState } from "react";

import Switcher from "app/components/elements/Switcher";
import SettingsHeader from "app/components/elements/SettingsHeader";

const Web3: FC = () => {
  const [metamaskMode, setMetamaskMode] = useState(false);

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader>Web3 configurations</SettingsHeader>
      <Switcher
        id="metamaskCompatible"
        label="Metamask Compatible Mode"
        text={metamaskMode ? "Enabled" : "Disabled"}
        checked={metamaskMode}
        onCheckedChange={setMetamaskMode}
        className="min-w-[17.75rem]"
      />
    </div>
  );
};

export default Web3;
