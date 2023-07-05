import type { ethers } from "ethers";

export const FEE_MODES = ["low", "average", "high"] as const;

export type FeeMode = (typeof FEE_MODES)[number];

export type FeeSuggestionsModern = {
  type: "modern";
  modes: Record<FeeMode, { max: ethers.BigNumber; priority: ethers.BigNumber }>;
};

export type FeeSuggestionsLegacy = {
  type: "legacy";
  modes: Record<FeeMode, { max: ethers.BigNumber }>;
};

export type FeeSuggestions = FeeSuggestionsModern | FeeSuggestionsLegacy;

export type GasPrices =
  | {
      type: "modern";
      modes: Record<FeeMode, { max: string; priority: string }>;
    }
  | {
      type: "legacy";
      modes: Record<FeeMode, { max: string }>;
    }
  | null;
