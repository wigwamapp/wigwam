import { FC } from "react";
import { useAtom } from "jotai";

import { testNetworksAtom } from "app/atoms";
import Switcher from "app/components/elements/Switcher";
import SettingsHeader from "app/components/elements/SettingsHeader";

const Advanced: FC = () => {
  const [testnetsVisibility, toggleTestnetsVisibility] =
    useAtom(testNetworksAtom);

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader>Advanced</SettingsHeader>
      <Switcher
        id="testNetworks"
        label="Test networks"
        text={testnetsVisibility ? "Visible" : "Hidden"}
        checked={testnetsVisibility}
        onCheckedChange={toggleTestnetsVisibility}
        className="min-w-[17.75rem]"
      />
    </div>
  );
};

export default Advanced;
