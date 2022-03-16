import { FC, useState } from "react";
import classNames from "clsx";

import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Switcher from "app/components/elements/Switcher";

const Web3: FC = () => {
  const [metamaskMode, setMetamaskMode] = useState(false);
  return (
    <ScrollAreaContainer
      className={classNames("flex flex-col py-3 px-4")}
      viewPortClassName="pb-20 rounded-t-[.625rem]"
      scrollBarClassName="py-0 pb-20"
    >
      <Switcher
        label="Metamask Compatible Mode"
        text={metamaskMode ? "Enabled" : "Disabled"}
        checked={metamaskMode}
        onCheckedChange={() => setMetamaskMode(!metamaskMode)}
      />
    </ScrollAreaContainer>
  );
};

export default Web3;
