import { FC, useCallback, useEffect } from "react";
import classNames from "clsx";
import { useAtom, useSetAtom } from "jotai";
import { isPopup } from "lib/ext/view";

import { AccountAsset } from "core/types";
import { TEvent, trackEvent } from "core/client";

import { receiveModalAtom, receiveTokenAtom } from "app/atoms";
import { useAccountToken } from "app/hooks";
import ShareAddress from "../screens/receiveTabs/ShareAddress";
import SecondaryModal, {
  SecondaryModalProps,
} from "../elements/SecondaryModal";
import AssetLogo from "../elements/AssetLogo";

type ReceiveModalProps = Pick<SecondaryModalProps, "open" | "onOpenChange">;

const ReceiveModal: FC<ReceiveModalProps> = (props) => {
  const isPopupMode = isPopup();
  const setReceiveToken = useSetAtom(receiveTokenAtom);
  const [receiveOpened, setReceiveOpened] = useAtom(receiveModalAtom);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setReceiveOpened([open, "replace"]);
      setReceiveToken([null, "replace"]);
    },
    [setReceiveOpened, setReceiveToken],
  );

  useEffect(() => {
    if (receiveOpened) {
      trackEvent(TEvent.ReceiveModalOpened, {
        page: isPopupMode ? "popup" : "dashboard",
      });
    }
  }, [receiveOpened, isPopupMode]);

  return (
    <SecondaryModal
      {...props}
      header={
        <p className="flex w-full justify-center items-center">
          Receive{" "}
          {receiveOpened && <TokenDetails key={String(receiveOpened)} />}
        </p>
      }
      small
      open={receiveOpened}
      onOpenChange={handleOpenChange}
      className={classNames("", !isPopupMode ? "max-w-[30rem]" : "")}
      headerClassName={classNames(
        "!m-0 !w-full",
        isPopupMode ? "!text-lg" : "!text-[1.5rem]",
      )}
    >
      <ShareAddress
        className={classNames(isPopupMode ? "mt-4" : "mt-8")}
        title="Wallet address"
        labelClassName="pl-0"
        walletNameDisplayed
      />
    </SecondaryModal>
  );
};

export default ReceiveModal;

const TokenDetails = () => {
  const [tokenSlug] = useAtom(receiveTokenAtom);
  const currentToken = useAccountToken(tokenSlug ?? "") as AccountAsset;

  return currentToken ? (
    <>
      <AssetLogo asset={currentToken} className="mx-2 h-6 w-6" />
      {currentToken.symbol}
    </>
  ) : null;
};
