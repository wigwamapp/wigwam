import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";

import { transferTabAtom } from "app/atoms";
import { TransferTab as TransferTabEnum } from "app/nav";
import { ToastOverflowProvider } from "app/hooks/toast";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import NetworksList from "app/components/blocks/NetworksList";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";
import { ReactComponent as AssetIcon } from "app/icons/transfer-asset.svg";
import { ReactComponent as NFTIcon } from "app/icons/transfer-nft.svg";

import TransferTab from "./Transfer.Tab";

const Transfer: FC = () => {
  const activeTabRoute = useAtomValue(transferTabAtom);
  const activeRoute = useMemo(
    () =>
      tabsContent.find(({ route }) => route.transfer === activeTabRoute)?.route,
    [activeTabRoute],
  );

  return (
    <>
      <NetworksList />

      <div className="flex min-h-0 grow">
        <SecondaryTabs tabs={tabsContent} activeRoute={activeRoute} />
        {activeRoute?.transfer !== TransferTabEnum.Bridge ? (
          <ScrollAreaContainer
            className="box-content w-full px-6"
            viewPortClassName="pb-5 pt-5"
            scrollBarClassName="py-0 pt-5 pb-5"
          >
            <ToastOverflowProvider>
              <div>
                <TransferTab />
              </div>
            </ToastOverflowProvider>
          </ScrollAreaContainer>
        ) : (
          <TransferTab />
        )}
      </div>
    </>
  );
};

export default Transfer;

const tabsContent = [
  {
    route: { page: "transfer", transfer: TransferTabEnum.Asset },
    title: "Token",
    Icon: AssetIcon,
    desc: "Send gas tokens or other fungible coins such as ERC20.",
  },
  {
    route: { page: "transfer", transfer: TransferTabEnum.Nft },
    title: "NFT",
    Icon: NFTIcon,
    desc: "Send NFTs or other non-fungible tokens such as ERC721 or ERC1155.",
  },
];
