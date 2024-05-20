import { FC } from "react";
import classNames from "clsx";
import { QRCodeCanvas } from "qrcode.react";

import { isPopup as isPopupPrimitive } from "lib/ext/view";
import { useCopyCanvasToClipboard } from "lib/react-hooks/useCopyCanvasToClipboard";

import { useAccounts } from "app/hooks";
import { useLazyNetwork } from "app/hooks";
import NetworksList from "app/components/blocks/NetworksList";
import AddressField from "app/components/elements/AddressField";
import Button from "app/components/elements/Button";
import { ReactComponent as ExternalLinkIcon } from "app/icons/external-link.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";

const Receive: FC = () => {
  const network = useLazyNetwork();
  const { currentAccount } = useAccounts();
  const { copy, copied } = useCopyCanvasToClipboard("#receive-canvas canvas");
  const isPopup = isPopupPrimitive();

  return (
    <>
      <NetworksList />

      <div className="flex min-h-0 grow">
        <div className="flex flex-col max-w-[23.25rem]">
          <h1 className="mt-5 mb-3 text-2xl font-bold">Buy tokens</h1>
          <AddressField
            value={currentAccount.address}
            label="Wallet address"
            readOnly
          />

          <div className="mt-6 flex">
            <div
              className={classNames(
                "flex items-center justify-center",
                "min-w-[6.25rem] h-[6.25rem]",
                "bg-white/[.08]",
                "rounded-[0.625rem]",
                "shadow-receiveqrcode",
              )}
              id="receive-canvas"
            >
              <QRCodeCanvas
                bgColor="#1C1E2F"
                fgColor="#F8FCFD"
                includeMargin={false}
                size={80}
                level="L"
                value={currentAccount.address}
              />
            </div>
            <div className="ml-4 flex flex-col items-start">
              <p className="text-brand-font text-xs">
                This address can be used to receive funds. Share it with someone
                or just use it for withdrawal on exchanges.
              </p>
              {!isPopup && (
                <Button
                  theme="tertiary"
                  className={classNames(
                    "text-sm text-brand-light !font-normal",
                    "!p-1 !pr-2 !min-w-0",
                    "-ml-2 mt-auto",
                    "items-center",
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
              )}
            </div>
          </div>
          {network?.faucetUrls && network.faucetUrls?.length > 0 && (
            <>
              <h3 className="mt-6 text-xl text-brand-light font-semibold">
                Faucets
              </h3>

              <div className="mt-4 flex flex-col">
                {network.faucetUrls.map((faucetUrl) => (
                  <a
                    key={faucetUrl}
                    href={faucetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classNames(
                      "mb-4 w-full",
                      "bg-brand-inactivelight/5",
                      "border border-brand-inactivedark/25",
                      "hover:bg-brand-inactivelight/10",
                      "rounded-lg",
                      "flex items-center py-2 px-4",
                      "text-base text-brand-light font-medium",
                      "hover:underline",
                    )}
                  >
                    {new URL(faucetUrl).host}
                    <ExternalLinkIcon className="ml-1 h-5 w-auto" />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Receive;
