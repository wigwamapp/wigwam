import { FC, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { waitForAll } from "jotai/utils";

import { allNetworksAtom, chainIdAtom, currentAccountAtom } from "app/atoms";
import { useLazyNetwork } from "app/hooks";
import PageLayout from "app/components/layouts/PageLayout";
import Select from "app/components/elements/Select";
import NetworkSelectPrimitive from "app/components/elements/NetworkSelect";
import NewButton from "app/components/elements/NewButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import WalletCard from "app/components/elements/WalletCard";
import IconedButton from "app/components/elements/IconedButton";
import Input from "app/components/elements/Input";
import LargeWalletCard from "app/components/elements/LargeWalletCard";
import WalletsList from "app/components/blocks/WalletsList";
import { ReactComponent as SettingsIcon } from "app/icons/settings-small.svg";
import { ReactComponent as ExternalLinkIcon } from "app/icons/external-link.svg";
import { ReactComponent as SearchIcon } from "app/icons/search-input.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy-input.svg";
import { SelectTempData } from "app/temp-data/select";

const Main: FC = () => (
  <PageLayout>
    <div className="py-8">
      {/*<h1 className="text-4xl font-bold text-brand-primary">Hello!</h1>*/}
      <ConditionalAccountsSelect />
      {/* <Kek /> */}
      {/*<NumberWrapper padding>*/}
      {/*  {ethers.utils.formatUnits(ethers.BigNumber.from("10000000"))}*/}
      {/*</NumberWrapper>*/}
    </div>
  </PageLayout>
);

export default Main;

const ConditionalAccountsSelect: FC = () => {
  const [select, setSelect] = useState(SelectTempData[0]);

  const { currentAccount } = useAtomValue(
    useMemo(
      () =>
        waitForAll({
          currentAccount: currentAccountAtom,
        }),
      []
    )
  );

  return (
    <div>
      <WalletsList />
      <Select
        items={SelectTempData}
        currentItem={select}
        setItem={(item) => setSelect(item)}
        className="mb-5"
      />
      <NetworkSelect className="mb-5" />
      <NewButton className="mr-5">Primary</NewButton>
      <NewButton
        href="https://www.google.com/"
        theme="secondary"
        className="mr-5"
      >
        Secondary
      </NewButton>
      <NewButton theme="tertiary" className="mr-5">
        Tertiary
      </NewButton>
      <div className="flex mt-5">
        <IconedButton
          className="mr-3"
          aria-label="Google"
          Icon={ExternalLinkIcon}
          href="https://www.google.com"
        />
        <IconedButton
          theme="tertiary"
          aria-label="Settings"
          Icon={SettingsIcon}
        />
      </div>
      <div className="grid gap-4 mt-5">
        <Input placeholder="Type something..." />
        <Input
          placeholder="Type name or address to search..."
          StartAdornment={SearchIcon}
        />
        <Input
          placeholder="Type name or address to search..."
          StartAdornment={SearchIcon}
          disabled
        />
        <Input
          label="Label"
          placeholder="Type name or address to search..."
          EndAdornment={CopyIcon}
          defaultValue="contract address"
          readOnly
          id="input-2"
        />
      </div>
      <ScrollAreaContainer className="h-[200px] my-5 w-40" type="always">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((el) => (
          <div key={el} className="p-4 w-80">
            {el}
          </div>
        ))}
      </ScrollAreaContainer>
      <LargeWalletCard account={currentAccount} />
      <WalletCard account={currentAccount} />
    </div>
  );
};

type NetworkSelectProps = {
  className?: string;
};

const NetworkSelect: FC<NetworkSelectProps> = ({ className }) => {
  const networks = useAtomValue(allNetworksAtom);
  const currentNetwork = useLazyNetwork(networks[0]);

  const setChainId = useSetAtom(chainIdAtom);

  return (
    <NetworkSelectPrimitive
      networks={networks}
      currentNetwork={currentNetwork}
      onNetworkChange={setChainId}
      className={className}
    />
  );
};
