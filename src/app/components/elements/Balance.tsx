import { FC, useEffect, useState } from "react";
import { ethers } from "ethers";

import { useNativeCurrency, useProvider } from "app/hooks";

type BalanceProps = {
  address: string;
  className?: string;
};

const Balance: FC<BalanceProps> = ({ address, className }) => {
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
    <span className={className}>
      {ethers.utils.formatEther(balance)} {nativeCurrency.symbol}
    </span>
  );
};

export default Balance;
