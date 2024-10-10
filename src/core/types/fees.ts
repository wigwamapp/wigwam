export const FEE_MODES = ["low", "average", "high"] as const;

export type FeeMode = (typeof FEE_MODES)[number];

export type FeeSuggestionsModern = {
  type: "modern";
  modes: Record<FeeMode, { max: bigint; priority: bigint }>;
  gasLimit?: bigint;
};

export type FeeSuggestionsLegacy = {
  type: "legacy";
  modes: Record<FeeMode, { max: bigint }>;
  gasLimit?: bigint;
};

export type FeeSuggestions = FeeSuggestionsModern | FeeSuggestionsLegacy;

export type GasPrices =
  | {
      type: "modern";
      modes: Record<FeeMode, { max: string; priority: string }>;
      gasLimit?: string;
    }
  | {
      type: "legacy";
      modes: Record<FeeMode, { max: string }>;
      gasLimit?: string;
    }
  | null;
