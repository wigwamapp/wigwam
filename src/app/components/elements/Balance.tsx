import { FC, useEffect, useState } from "react";
import { ethers } from "ethers";

import { useNativeCurrency, useProvider } from "app/hooks";
import PrettyAmount from "./PrettyAmount";

type BalanceProps = {
  address: string;
  copiable?: boolean;
  className?: string;
};

const Balance: FC<BalanceProps> = ({
  address,
  copiable = false,
  className,
}) => {
  const provider = useProvider();
  const nativeCurrency = useNativeCurrency();

  const [balance, setBalance] = useState<ethers.BigNumber | null>(null);

  useEffect(() => {
    let mounted = true;

    setBalance(null);

    provider
      .getBalance(address)
      .then((b) => mounted && setBalance(b))
      .catch(console.error);

    return () => {
      mounted = false;
    };
  }, [address, provider]);

  if (!balance || !nativeCurrency) {
    return <></>;
  }

  return (
    <PrettyAmount
      amount={ethers.utils.formatEther(balance)}
      currency={nativeCurrency.symbol}
      copiable={copiable}
      className={className}
    />
  );
};

export default Balance;
