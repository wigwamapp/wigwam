import { FC } from "react";
import { useAtom } from "jotai";

import { testNetworksAtom } from "app/atoms";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Switcher from "app/components/elements/Switcher";
import SettingsHeader from "app/components/elements/SettingsHeader";

const Advanced: FC = () => {
  const [show, updateAtom] = useAtom(testNetworksAtom);
  const toggleTestNetworks = () => {
    updateAtom(!show);
  };

  return (
    <ScrollAreaContainer
      className="flex flex-col px-4"
      viewPortClassName="pb-20"
      scrollBarClassName="py-0 pb-20"
    >
      <SettingsHeader>Advanced</SettingsHeader>
      <Switcher
        label="Show/hide test networks"
        text={show ? "Visible" : "Hidden"}
        checked={show}
        onCheckedChange={toggleTestNetworks}
        className="min-w-[17.75rem]"
      />
    </ScrollAreaContainer>
  );
};

export default Advanced;
