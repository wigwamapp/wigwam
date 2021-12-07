import { FC, Suspense, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAtomValue } from "jotai/utils";

import { chainIdAtom, getNetworkAtom, getProviderAtom } from "app/atoms";

type BalanceProps = {
  address: string;
  chainId?: number;
  className?: string;
};

const Balance: FC<BalanceProps> = ({ address, chainId, className }) => {
  const currentChainId = useAtomValue(chainIdAtom);
  const finalChainId = chainId ?? currentChainId;

  const network = useAtomValue(getNetworkAtom(finalChainId));
  const provider = useAtomValue(getProviderAtom);

  const [balance, setBalance] = useState<ethers.BigNumber | null>(null);

  useEffect(() => {
    let mounted = true;

    provider
      .getBalance(address)
      .then((b) => mounted && setBalance(b))
      .catch(console.error);

    return () => {
      mounted = false;
    };
  }, [address, provider]);

  if (!balance || !network) {
    return <></>;
  }

  return (
    <span className={className}>
      {ethers.utils.formatEther(balance)} {network.nativeCurrency.symbol}
    </span>
  );
};

const SafeBalance: typeof Balance = (props) => (
  <Suspense fallback={null}>
    <Balance {...props} />
  </Suspense>
);

export default SafeBalance;
