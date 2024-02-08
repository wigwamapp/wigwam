import { ComponentProps, FC } from "react";
import BigNumber from "bignumber.js";
import { useLazyAtomValue } from "lib/atom-utils";

import { getTotalAccountBalanceAtom } from "app/atoms";

import FiatAmount from "./FiatAmount";

const TotalWalletBalance: FC<
  Omit<ComponentProps<typeof FiatAmount>, "amount"> & { address: string }
> = ({ address, isMinified, ...rest }) => {
  const balance = useLazyAtomValue(getTotalAccountBalanceAtom(address), "off");

  return balance ? (
    <FiatAmount
      amount={balance}
      isMinified={isMinified ?? new BigNumber(balance).isLessThan(0.01)}
      {...rest}
    />
  ) : null;
};

export default TotalWalletBalance;
