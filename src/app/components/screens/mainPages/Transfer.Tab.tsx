import { FC, Suspense, useMemo } from "react";
import { useAtomValue } from "jotai";
import { match } from "ts-pattern";
import { Redirect } from "lib/navigation";

import { Page, TransferTab as TransferTabEnum } from "app/nav";
import { transferTabAtom } from "app/atoms";

import Asset from "../transferTabs/Asset";
import Nft from "../transferTabs/Nft";
import Bridge from "../transferTabs/Bridge";

function matchTransferTab(transferTab: TransferTabEnum) {
  return (
    match(transferTab)
      .with(TransferTabEnum.Asset, () => <Asset />)
      .with(TransferTabEnum.Nft, () => <Nft />)
      .with(TransferTabEnum.Bridge, () => <Bridge />)
      // Redirect to default
      .otherwise(() => (
        <Redirect
          to={{ page: Page.Transfer, transfer: TransferTabEnum.Asset }}
        />
      ))
  );
}

const TransferTab: FC = () => {
  const transferTab = useAtomValue(transferTabAtom);

  return useMemo(
    () => <Suspense fallback={null}>{matchTransferTab(transferTab)}</Suspense>,
    [transferTab],
  );
};

export default TransferTab;
