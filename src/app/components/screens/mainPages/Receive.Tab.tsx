import { FC, Suspense, useMemo } from "react";
import { useAtomValue } from "jotai";
import { match } from "ts-pattern";
import { Redirect } from "lib/navigation";

import { Page, ReceiveTab as ReceiveTabEnum } from "app/nav";
import { receiveTabAtom } from "app/atoms";

import ShareAddress from "../receiveTabs/ShareAddress";
import BuyWithFiat from "../receiveTabs/BuyWithFiat";
import Faucet from "../receiveTabs/Faucet";

function matchReceiveTab(receiveTab: ReceiveTabEnum, tabs: ReceiveTabEnum[]) {
  const redirectToDefault = () => (
    <Redirect
      to={{ page: Page.Receive, receive: ReceiveTabEnum.BuyWithFiat }}
    />
  );

  if (!tabs.includes(receiveTab)) {
    return redirectToDefault();
  }

  return (
    match(receiveTab)
      .with(ReceiveTabEnum.ShareAddress, () => <ShareAddress />)
      .with(ReceiveTabEnum.BuyWithFiat, () => <BuyWithFiat />)
      .with(ReceiveTabEnum.Faucet, () => <Faucet />)
      // Redirect to default
      .otherwise(redirectToDefault)
  );
}

const ReceiveTab: FC<{ tabs: ReceiveTabEnum[] }> = ({ tabs }) => {
  const receiveTab = useAtomValue(receiveTabAtom);

  return useMemo(
    () => (
      <Suspense fallback={null}>{matchReceiveTab(receiveTab, tabs)}</Suspense>
    ),
    [receiveTab, tabs],
  );
};

export default ReceiveTab;
