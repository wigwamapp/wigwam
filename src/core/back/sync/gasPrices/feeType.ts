/**
 * Which shape of transaction a chain expects: EIP-1559 (`modern`) or a plain
 * `gasPrice` (`legacy`).
 *
 * The method a node answers with is not the answer to this question. Almost
 * every chain implements `eth_feeHistory` today, including the ones that never
 * adopted a base-fee market, so asking the node only tells us the call exists.
 *
 * What actually decides it is whether the chain burns a base fee. When the base
 * fee is permanently zero — BNB Smart Chain is the well known one — a type-2
 * transaction degenerates into `maxFeePerGas == maxPriorityFeePerGas`: a
 * "priority fee" that is really the whole gas price, shown to the user as a tip
 * over a base fee that does not exist. Such a chain prices transactions the
 * legacy way, and so should we.
 */

export type FeeType = "modern" | "legacy";

/**
 * Chains whose shape is stated here instead of being read off the chain.
 *
 * The rule below is enough on its own; entries exist for chains where the
 * answer must not depend on what an RPC happens to report, since a proxy or a
 * forked node can answer with a fabricated base fee.
 */
const FEE_TYPE_BY_CHAIN = new Map<number, FeeType>([
  // BNB Smart Chain: no base fee, validators price by a minimum gas price
  [56, "legacy"], // Mainnet
  [97, "legacy"], // Testnet
]);

/**
 * @param baseFee - Base fee of the block being built next, `null` when the
 * chain reports none at all
 */
export function resolveFeeType(
  chainId: number,
  baseFee: bigint | null,
): FeeType {
  const declared = FEE_TYPE_BY_CHAIN.get(chainId);
  if (declared) return declared;

  // A chain with no base fee to bid over has nothing for a tip to mean
  return baseFee !== null && baseFee > 0n ? "modern" : "legacy";
}
