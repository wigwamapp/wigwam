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
  v?: ethers.BigNumberish | null,
  unit: ethers.BigNumberish = 0,
) {
  if (!v && v !== 0) return "";
  return ethers.formatUnits(v, unit);
}

export function parseUnits(v: string, unit: string | ethers.BigNumberish = 0) {
  try {
    return ethers.parseUnits(v, unit);
  } catch {
    return null;
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
    new BigNumber(10).pow(decimals),
  );
  const finalValue = preparedValue[operator](valueToChange);

  return finalValue.gt(0) ? BigInt(finalValue.toString()) : 0n;
};
