import { FC } from "react";
import classNames from "clsx";

import { useAccounts, useLazyNetwork } from "app/hooks";
import AddressField from "app/components/elements/AddressField";
import { ReactComponent as ExternalLinkIcon } from "app/icons/external-link.svg";

const Faucet: FC = () => {
  const { currentAccount } = useAccounts();
  const network = useLazyNetwork();

  return (
    <div className="flex flex-col max-w-[23.25rem]">
      <AddressField
        value={currentAccount.address}
        label="Wallet address"
        readOnly
      />

      <p className="mt-1 px-4 text-brand-font text-xs">
        Use this wallet address to receive funds on faucets.
      </p>

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
  );
};

export default Faucet;
