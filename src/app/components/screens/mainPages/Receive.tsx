import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";

import { receiveTabAtom } from "app/atoms";
import { ReceiveTab as ReceiveTabEnum } from "app/nav";
import WalletsList from "app/components/blocks/WalletsList";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import ReceiveTab from "./Receive.Tab";

const Receive: FC = () => {
  const activeTabRoute = useAtomValue(receiveTabAtom);
  const activeRoute = useMemo(
    () =>
      tabsContent.find(({ route }) => route.receive === activeTabRoute)?.route,
    [activeTabRoute]
  );

  return (
    <>
      <WalletsList />

      <div className="flex min-h-0 grow">
        <SecondaryTabs tabs={tabsContent} activeRoute={activeRoute} />
        <ScrollAreaContainer
          className="box-content w-full px-6"
          viewPortClassName="pb-20 pt-5"
          scrollBarClassName="py-0 pt-5 pb-20"
        >
          <div className="max-w-[23.25rem]">
            <ReceiveTab />
          </div>
        </ScrollAreaContainer>
      </div>
    </>
  );
};

export default Receive;

const tabsContent = [
  {
    route: { page: "receive", receive: ReceiveTabEnum.ShareAddress },
    title: "Share address",
    desc: "View your current wallet address. Share it or use it on exchanges to receive funds.",
  },
  {
    route: { page: "receive", receive: ReceiveTabEnum.BuyWithCrypto },
    title: "Buy with Crypto",
    desc: "Top up balance with cryptocurrency from other networks using third-party services.",
  },
  {
    route: { page: "receive", receive: ReceiveTabEnum.BuyWithFiat },
    title: "Buy with Fiat",
    desc: "Top up balance with regular credit or debit cards using third-party services.",
  },
];
