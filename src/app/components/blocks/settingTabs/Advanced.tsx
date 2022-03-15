import { FC } from "react";
import classNames from "clsx";
import { useAtom } from "jotai";

import { testNetworksAtom } from "app/atoms";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Switcher from "app/components/elements/Switcher";

const Advanced: FC = () => {
  const [show, updateAtom] = useAtom(testNetworksAtom);
  const toggleTestNetworks = () => {
    updateAtom(!show);
  };

  return (
    <ScrollAreaContainer
      className={classNames("flex flex-col py-3 px-4")}
      viewPortClassName="pb-20 rounded-t-[.625rem]"
      scrollBarClassName="py-0 pb-20"
    >
      <Switcher
        label="Show/hide test networks"
        text={show ? "Visible" : "Hidden"}
        checked={show}
        onCheckedChange={toggleTestNetworks}
      />
    </ScrollAreaContainer>
  );
};

export default Advanced;
