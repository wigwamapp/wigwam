import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { waitForAll } from "jotai/utils";
import classNames from "clsx";
import useForceUpdate from "use-force-update";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { TReplace } from "lib/ext/i18n/react";

import { allAccountsAtom, currentAccountAtom } from "app/atoms";
import { useToken } from "app/hooks";
import Avatar from "app/components/elements/Avatar";
import NewButton from "app/components/elements/NewButton";
import Checkbox from "app/components/elements/Checkbox";
import AutoIcon from "app/components/elements/AutoIcon";
import HashPreview from "app/components/elements/HashPreview";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import Separator from "app/components/elements/Seperator";
import TooltipIcon from "app/components/elements/TooltipIcon";
import Tooltip from "app/components/elements/Tooltip";
import USDAmount from "app/components/elements/USDAmount";
import { ReactComponent as BalanceIcon } from "app/icons/dapp-balance.svg";
import { ReactComponent as TransactionsIcon } from "app/icons/dapp-transactions.svg";
import { ReactComponent as FundsIcon } from "app/icons/dapp-move-funds.svg";
import { ReactComponent as GasIcon } from "app/icons/gas.svg";

const ConnectDapp: FC = () => {
  const { currentAccount, allAccounts } = useAtomValue(
    useMemo(
      () =>
        waitForAll({
          currentAccount: currentAccountAtom,
          allAccounts: allAccountsAtom,
        }),
      []
    )
  );

  const preparedAccounts = useMemo(
    () => [
      currentAccount,
      ...allAccounts.filter(
        ({ address }) => address !== currentAccount.address
      ),
    ],
    [allAccounts, currentAccount]
  );

  const accountsToConnectRef = useRef(new Set<string>());

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    accountsToConnectRef.current.add(currentAccount.address);
    forceUpdate();
  }, [currentAccount.address, forceUpdate]);

  const toggleAccount = useCallback(
    (address: string) => {
      const addressesToAdd = accountsToConnectRef.current;
      if (addressesToAdd.has(address)) {
        addressesToAdd.delete(address);
      } else {
        addressesToAdd.add(address);
      }

      setAllAccountsChecked(addressesToAdd.size === allAccounts.length);

      forceUpdate();
    },
    [allAccounts.length, forceUpdate]
  );

  const [allAccountsChecked, setAllAccountsChecked] = useState(false);

  const toggleAllAccounts = useCallback(
    (remove = false) => {
      const accountsToAdd = accountsToConnectRef.current;
      allAccounts.forEach(({ address }) => {
        if (remove) {
          if (accountsToAdd.has(address)) {
            accountsToAdd.delete(address);
          }
        } else {
          if (!accountsToAdd.has(address)) {
            accountsToAdd.add(address);
          }
        }
      });
      setAllAccountsChecked((prevState) => !prevState);
      forceUpdate();
    },
    [allAccounts, forceUpdate]
  );

  return (
    <div className="h-screen flex flex-col items-center pt-8 pb-5 px-6">
      <DappLogos />
      <h1 className="text-2xl font-bold mt-4 mb-1">Connect to website</h1>
      <span className="text-base mb-6">compound.finance</span>
      <div className="w-full flex items-center px-3 pb-1.5">
        <CheckboxPrimitive.Root
          checked={allAccountsChecked}
          onCheckedChange={(checked) => toggleAllAccounts(!checked)}
          className="flex items-center"
        >
          <Checkbox checked={allAccountsChecked} className="mr-2.5" />
          <span className="text-brand-inactivedark2">Select all</span>
        </CheckboxPrimitive.Root>
        <Tooltip
          content={
            <>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                aliquam, purus sit amet luctus venenatis, lectus magna fringilla
                urna, porttitor rhoncus dolor purus non enim praesent elementum
                facilisis leo
              </p>
              <p className="mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
                aliquam, purus sit amet luctus venenatis, lectus magna fringilla
                urna, porttitor rhoncus
              </p>
            </>
          }
          placement="left-end"
          size="large"
          className="ml-auto"
        >
          <TooltipIcon />
        </Tooltip>
      </div>
      <Separator />
      <ScrollAreaContainer
        className="w-full box-content -mr-5 pr-5"
        viewPortClassName="py-2.5 viewportBlock"
      >
        {preparedAccounts.map(({ name, address }, i) => (
          <Account
            key={address}
            name={name}
            address={address}
            checked={accountsToConnectRef.current.has(address)}
            onToggleAdd={() => toggleAccount(address)}
            className={i !== preparedAccounts.length - 1 ? "mb-1" : ""}
          />
        ))}
      </ScrollAreaContainer>
      <ConnectionWarnings />
      <div className="grid grid-cols-2 gap-3 w-full mt-5">
        <NewButton theme="secondary" className="w-full">
          Deny
        </NewButton>
        <NewButton className="w-full">Connect</NewButton>
      </div>
    </div>
  );
};

export default ConnectDapp;

const iconsClassNames = classNames(
  "w-[4.65rem] h-[4.75rem] min-w-[4.75rem]",
  "border border-brand-main/60"
);

const DappLogos: FC = () => (
  <div className="flex items-center">
    <Avatar
      className={classNames(iconsClassNames, "z-10")}
      src="data:image/png;base64,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"
    />
    <Avatar
      className={classNames(iconsClassNames, "-ml-7")}
      src="data:image/png;base64,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"
    />
  </div>
);

const warnings = [
  {
    Icon: BalanceIcon,
    label: "See wallet balance and activity",
  },
  {
    Icon: TransactionsIcon,
    label: "Send requests for transactions",
  },
  {
    Icon: FundsIcon,
    label: "CANNOT move funds without permission",
  },
];

const ConnectionWarnings: FC = () => (
  <div className="grid grid-cols-3 gap-3 py-3 border-y border-brand-main/[.07] mt-auto">
    {warnings.map(({ label, Icon }) => (
      <div key={label} className="flex flex-col items-center text-center">
        <Icon />
        <h4 className="text-xs text-brand-inactivedark mt-2">{label}</h4>
      </div>
    ))}
  </div>
);

type AccountProps = {
  name: string;
  address: string;
  checked: boolean;
  onToggleAdd: () => void;
  className?: string;
};

const Account: FC<AccountProps> = ({
  name,
  address,
  checked,
  onToggleAdd,
  className,
}) => {
  const nativeToken = useToken(address);
  const portfolioBalance = nativeToken?.portfolioUSD;

  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={onToggleAdd}
      className={classNames(
        "w-full",
        "flex items-center",
        "min-w-0 px-3 py-1.5",
        "rounded-[.625rem]",
        "transition-colors",
        "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
        className
      )}
    >
      <Checkbox checked={checked} className="mr-4 min-w-[1.25rem]" />

      <AutoIcon
        seed={address}
        source="dicebear"
        type="personas"
        className={classNames(
          "h-8 w-8 min-w-[2rem]",
          "mr-3",
          "bg-black/20",
          "rounded-[.625rem]"
        )}
      />

      <span className="flex flex-col text-left min-w-0 max-w-[40%] mr-auto">
        <span className="font-bold truncate">
          <TReplace msg={name} />
        </span>
        <HashPreview
          hash={address}
          className="text-xs text-brand-inactivedark font-normal mt-[2px]"
          withTooltip={false}
        />
      </span>
      <span className="flex flex-col text-right min-w-0">
        <USDAmount
          amount={
            nativeToken
              ? portfolioBalance ??
                ethers.utils.formatEther(nativeToken.rawBalance)
              : null
          }
          currency={portfolioBalance ? "$" : nativeToken?.symbol}
          isMinified={
            portfolioBalance
              ? new BigNumber(portfolioBalance).isLessThan(0.01)
              : false
          }
          className="text-sm font-bold text-brand-light ml-2"
        />
        {portfolioBalance && (
          <USDAmount
            amount={
              nativeToken
                ? ethers.utils.formatEther(nativeToken.rawBalance)
                : null
            }
            currency={nativeToken?.symbol}
            isMinified
            prefix={<GasIcon className="w-2.5 h-2.5 mr-0.5" />}
            className="text-xs leading-4 text-brand-inactivedark font-normal flex items-center max-h-[1rem]"
          />
        )}
      </span>
    </CheckboxPrimitive.Root>
  );
};
