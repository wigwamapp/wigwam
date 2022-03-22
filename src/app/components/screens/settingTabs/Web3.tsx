import { FC, useState } from "react";

import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Switcher from "app/components/elements/Switcher";
import SettingsHeader from "app/components/elements/SettingsHeader";

const Web3: FC = () => {
  const [metamaskMode, setMetamaskMode] = useState(false);

  return (
    <ScrollAreaContainer
      className="flex flex-col px-4"
      viewPortClassName="pb-20"
      scrollBarClassName="py-0 pb-20"
    >
      <SettingsHeader>Web3 configurations</SettingsHeader>
      <Switcher
        label="Metamask Compatible Mode"
        text={metamaskMode ? "Enabled" : "Disabled"}
        checked={metamaskMode}
        onCheckedChange={setMetamaskMode}
        className="min-w-[17.75rem]"
      />
    </ScrollAreaContainer>
  );
};

export default Web3;
