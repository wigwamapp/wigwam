import { createElement, ReactNode } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import { FeeMode } from "core/types/fees";

// All side-view vehicle emojis face left on every major platform,
// so mirror the car to match the plane and the rocket direction
const CarIcon = createElement(
  "span",
  { className: "inline-block -scale-x-100" },
  "🚙",
);

export const FEE_MODE_NAMES: Record<
  FeeMode,
  { icon: ReactNode; name: ReactNode }
> = {
  low: { icon: CarIcon, name: "Standard" },
  average: { icon: "✈️", name: "Fast" },
  high: { icon: "🚀", name: "Rapid" },
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
