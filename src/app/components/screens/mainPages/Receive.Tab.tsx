import { FC, Suspense, useMemo } from "react";
import { useAtomValue } from "jotai";
import { match } from "ts-pattern";
import { Redirect } from "lib/navigation";

import { ReceiveTab as ReceiveTabEnum } from "app/nav";
import { receiveTabAtom } from "app/atoms";

import ShareAddress from "../receiveTabs/ShareAddress";
import BuyWithCrypto from "../receiveTabs/BuyWithCrypto";
import BuyWithFiat from "../receiveTabs/BuyWithFiat";

function matchReceiveTab(receiveTab: ReceiveTabEnum) {
  return (
    match(receiveTab)
      .with(ReceiveTabEnum.ShareAddress, () => <ShareAddress />)
      .with(ReceiveTabEnum.BuyWithCrypto, () => <BuyWithCrypto />)
      .with(ReceiveTabEnum.BuyWithFiat, () => <BuyWithFiat />)
      // Redirect to default
      .otherwise(() => (
        <Redirect to={{ settingTab: ReceiveTabEnum.ShareAddress }} />
      ))
  );
}

const TransferTab: FC = () => {
  const receiveTab = useAtomValue(receiveTabAtom);

  return useMemo(
    () => <Suspense fallback={null}>{matchReceiveTab(receiveTab)}</Suspense>,
    [receiveTab]
  );
};

export default TransferTab;
