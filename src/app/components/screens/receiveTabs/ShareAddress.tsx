import { FC } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { QRCodeCanvas } from "qrcode.react";
import { useCopyCanvasToClipboard } from "lib/react-hooks/useCopyCanvasToClipboard";

import { currentAccountAtom } from "app/atoms";
import AddressField from "app/components/elements/AddressField";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import Button from "app/components/elements/Button";

const ShareAddress: FC = () => {
  const { address } = useAtomValue(currentAccountAtom);
  const { copy, copied } = useCopyCanvasToClipboard("#receive-canvas canvas");

  return (
    <div className="flex flex-col max-w-[23.25rem]">
      <AddressField value={address} label="Wallet address" readOnly />
      <div className="mt-6 flex">
        <div
          className={classNames(
            "flex items-center justify-center",
            "min-w-[6.25rem] h-[6.25rem]",
            "bg-white/[.08]",
            "rounded-[0.625rem]",
            "shadow-receiveqrcode"
          )}
          id="receive-canvas"
        >
          <QRCodeCanvas
            bgColor="#1C1E2F"
            fgColor="#F8F9FD"
            includeMargin={false}
            size={80}
            level="L"
            value={address}
          />
        </div>
        <div className="ml-4 flex flex-col items-start">
          <p className="text-brand-font">
            This address can be used to receive funds. Share it with someone or
            just use it for withdrawal on exchanges.
          </p>
          <Button
            theme="tertiary"
            className={classNames(
              "text-sm text-brand-light !font-normal",
              "!p-1 !pr-2 !min-w-0",
              "-ml-2 mt-auto",
              "items-center"
            )}
            onClick={copy}
          >
            {copied ? (
              <SuccessIcon className="mr-1" />
            ) : (
              <CopyIcon className="mr-1" />
            )}
            {copied ? "Media copied" : "Copy Media"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareAddress;
