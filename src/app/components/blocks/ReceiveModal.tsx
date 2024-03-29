import { FC, useCallback } from "react";
import classNames from "clsx";
import { useAtom, useSetAtom } from "jotai";

import { receiveModalAtom, receiveTokenAtom } from "app/atoms";
import { AccountAsset } from "core/types";
import { useAccountToken } from "app/hooks";
import { isPopup } from "lib/ext/view";
import ShareAddress from "../screens/receiveTabs/ShareAddress";
import SecondaryModal, {
  SecondaryModalProps,
} from "../elements/SecondaryModal";
import AssetLogo from "../elements/AssetLogo";

type ReceiveModalProps = Pick<SecondaryModalProps, "open" | "onOpenChange">;

const ReceiveModal: FC<ReceiveModalProps> = (props) => {
  const isPopupMode = isPopup();
  const [tokenSlug] = useAtom(receiveTokenAtom);
  const currentToken = useAccountToken(tokenSlug ?? "") as AccountAsset;
  const setReceiveToken = useSetAtom(receiveTokenAtom);
  const [receiveOpened, setReceiveOpened] = useAtom(receiveModalAtom);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setReceiveOpened([open, "replace"]);
      setReceiveToken([null, "replace"]);
    },
    [setReceiveOpened, setReceiveToken],
  );

  return (
    <SecondaryModal
      {...props}
      header={
        <p className="flex w-full justify-center">
          Receive{" "}
          {currentToken ? (
            <>
              <AssetLogo asset={currentToken} className="mx-2 h-6 w-6" />
              {currentToken.symbol}
            </>
          ) : null}
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
      />
    </SecondaryModal>
  );
};

export default ReceiveModal;
