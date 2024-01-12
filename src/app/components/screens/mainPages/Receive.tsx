import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";

import { AccountAsset, Network } from "core/types";

import { receiveTabAtom, tokenSlugAtom } from "app/atoms";
import { useAccountToken, useChainId, useLazyNetwork } from "app/hooks";
import { ReceiveTab as ReceiveTabEnum } from "app/nav";
import WalletsList from "app/components/blocks/WalletsList";
import SecondaryTabs from "app/components/blocks/SecondaryTabs";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as AddressIcon } from "app/icons/receive-address.svg";
// import { ReactComponent as CryptoIcon } from "app/icons/receive-crypto.svg";
import { ReactComponent as FiatIcon } from "app/icons/receive-fiat.svg";
import { ReactComponent as FaucetIcon } from "app/icons/receive-faucet.svg";

import ReceiveTab from "./Receive.Tab";

const Receive: FC = () => {
  const activeTabRoute = useAtomValue(receiveTabAtom);
  const network = useLazyNetwork();
  const tokenSlug = useAtomValue(tokenSlugAtom)!;
  const chainId = useChainId();
  const chainTokenSlug = useMemo(() => `${chainId}_NATIVE_0_0`, [chainId]);
  const tokenInfo = useAccountToken(tokenSlug) as AccountAsset | undefined;

  const tabsContent = useMemo(
    () => getTabsContent(chainTokenSlug, tokenInfo, network),
    [network, tokenInfo, chainTokenSlug],
  );
  const tabs = useMemo(
    () =>
      tabsContent
        .map((t) => t.route.receive)
        .filter((q) => Boolean(q)) as ReceiveTabEnum[],
    [tabsContent],
  );

  const activeRoute = useMemo(
    () =>
      tabsContent.find(({ route }) => route.receive === activeTabRoute)?.route,
    [tabsContent, activeTabRoute],
  );

  return (
    <>
      <WalletsList />

      <div className="flex min-h-0 grow">
        <SecondaryTabs tabs={tabsContent} activeRoute={activeRoute} />
        {activeRoute?.receive === ReceiveTabEnum.ShareAddress ||
        activeRoute?.receive === ReceiveTabEnum.Faucet ? (
          <ScrollAreaContainer
            className="box-content w-full px-6"
            viewPortClassName="pb-20 pt-5"
            scrollBarClassName="py-0 pt-5 pb-20"
          >
            <div>
              <ReceiveTab tabs={tabs} />
            </div>
          </ScrollAreaContainer>
        ) : (
          <ReceiveTab tabs={tabs} />
        )}
      </div>
    </>
  );
};

export default Receive;

const getTabsContent = (
  slug: string,
  tokenInfo: AccountAsset | undefined,
  network?: Network,
) => [
  {
    route: { page: "receive", receive: ReceiveTabEnum.ShareAddress },
    title: "Share address",
    Icon: AddressIcon,
    desc: "View current wallet address. Share it or use it on exchanges to receive funds.",
  },
  ...(network?.type === "mainnet"
    ? [
        // {
        //   route: { page: "receive", receive: ReceiveTabEnum.BuyWithCrypto },
        //   title: "Buy with Crypto",
        //   Icon: CryptoIcon,
        //   desc: "Top up balance with crypto from other networks using third-party services.",
        //   soon: true,
        // },
        {
          route: {
            page: "receive",
            onRampOpened: true,
            cryptoCurrency: slug,
            token: tokenInfo?.tokenSlug,
          },
          title: "Buy with Fiat",
          Icon: FiatIcon,
          desc: "Top up balance with regular credit or debit cards using third-party services.",
          // soon: true,
        },
      ]
    : []),
  ...(network?.type === "testnet" && network.faucetUrls?.length
    ? [
        {
          route: { page: "receive", receive: ReceiveTabEnum.Faucet },
          title: "Faucet",
          Icon: FaucetIcon,
          desc: "Top up balance with testnet tokens for free.",
        },
      ]
    : []),
];
