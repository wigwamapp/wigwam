import type { ethers } from "ethers";
import type { suggestFees as suggestFeesPrimitive } from "@rainbow-me/fee-suggestions";

export const FEE_MODES = ["low", "average", "high"] as const;

export type FeeMode = typeof FEE_MODES[number];

export type FeesByModeModern = Record<
  FeeMode,
  { max: ethers.BigNumber; priority: ethers.BigNumber }
>;
export type FeeSuggestionsModern = Awaited<
  ReturnType<typeof suggestFeesPrimitive>
> & {
  type: "modern";
  modes: FeesByModeModern;
};

export type FeeSuggestionsLegacy = {
  type: "legacy";
  modes: Record<FeeMode, { max: ethers.BigNumber }>;
};

export type FeeSuggestions = FeeSuggestionsModern | FeeSuggestionsLegacy;

export type TPGasPrices =
  | {
      type: "modern";
      modes: Record<FeeMode, { max: string; priority: string }>;
    }
  | {
      type: "legacy";
      modes: Record<FeeMode, { max: string }>;
    }
  | null;
