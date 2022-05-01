import { FC } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { QRCodeCanvas } from "qrcode.react";

import { currentAccountAtom } from "app/atoms";
import AddressField from "app/components/elements/AddressField";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import NewButton from "app/components/elements/NewButton";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

const ShareAddress: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);

  const handleCopying = async () => {
    const canvas = document.getElementsByTagName("canvas")[0];
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.canvas.toBlob((blob) => {
        const item = new ClipboardItem({ "image/png": blob ?? "" });
        navigator.clipboard.write([item]);
      });
    }
  };
  const { copy, copied } = useCopyToClipboard(
    undefined,
    undefined,
    undefined,
    handleCopying
  );

  return (
    <div className="flex flex-col">
      <AddressField
        className="max-w-[23.25rem]"
        defaultValue={currentAccount.address}
        label="Wallet address"
        readOnly
      />
      <div className={classNames("mt-[1.625rem]", "flex")}>
        <div
          className={classNames(
            "flex items-center justify-center",
            "min-w-[100px] h-[100px]",
            "bg-white/[.08]",
            "backdrop-blur-[10px]",
            "border border-brand-light/5",
            "rounded-[10px]",
            "box-shadow"
          )}
        >
          <QRCodeCanvas
            bgColor="#1C1E2F"
            fgColor="#F8F9FD"
            includeMargin={false}
            size={80}
            level="L"
            value={currentAccount.address}
          />
        </div>
        <div className="ml-4 flex flex-col">
          <p className="text-brand-font">
            This address can be used to receive funds. Share it with someone or
            just use it for withdrawal on exchanges.
          </p>
          <NewButton
            theme="tertiary"
            wrapperClassName="w-full"
            className="mt-[0.5rem] !pl-0 max-w-[6.5rem] items-center"
            onClick={copy}
          >
            {copied ? <SuccessIcon /> : <CopyIcon />}
            <span className="ml-3 text-sm font-medium">
              {copied ? "Media copied" : "Copy Media"}
            </span>
          </NewButton>
        </div>
      </div>
    </div>
  );
};

export default ShareAddress;
