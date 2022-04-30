import { FC } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { QRCodeCanvas } from "qrcode.react";

import { currentAccountAtom } from "app/atoms";
import AddressField from "app/components/elements/AddressField";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import NewButton from "app/components/elements/NewButton";

const ShareAddress: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);

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
            bgColor="rgb(255 255 255 / .08)"
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
            onClick={async () => {
              const blob = new Blob();
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
              ]);
            }}
          >
            <CopyIcon />
            <span className="ml-3 text-sm font-medium">Copy Media</span>
          </NewButton>
        </div>
      </div>
    </div>
  );
};

export default ShareAddress;
