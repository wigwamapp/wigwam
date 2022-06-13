import { ReactNode } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import { FeeMode } from "core/types/fees";

export const FEE_MODE_NAMES: Record<
  FeeMode,
  { icon: ReactNode; name: ReactNode }
> = {
  low: { icon: "🐌", name: "Eco" },
  average: { icon: "🥑", name: "Market" },
  high: { icon: "💨", name: "ASAP" },
};

export const CUSTOM_FEE_MODE = { icon: "⚙️", name: "Custom" };

export function formatUnits(
  v?: ethers.BigNumberish,
  unit: ethers.BigNumberish = 0
) {
  if (!v && v !== 0) return "";
  return ethers.utils.formatUnits(v, unit);
}

export function parseUnits(v: string, unit: ethers.BigNumberish = 0) {
  try {
    return ethers.utils.parseUnits(v, unit);
  } catch {
    return "";
  }
}

export const prepareAmountOnChange = ({
  value,
  decimals = 9,
  operator = "plus",
}: {
  value: BigNumber.Value;
  decimals?: number;
  operator?: "plus" | "minus";
}) => {
  const preparedValue = new BigNumber(value);
  const valueToChange = new BigNumber(1).multipliedBy(
    new BigNumber(10).pow(decimals)
  );
  const finalValue = preparedValue[operator](valueToChange);

  return finalValue.gt(0) ? ethers.BigNumber.from(finalValue.toString()) : 0;
};
