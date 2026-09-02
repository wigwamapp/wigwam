import {
  fetchAccountNFTs as fetchBlockscoutNFTs,
  supportsBlockscout,
  NftCollection,
} from "../../blockscout";
import {
  fetchAccountNFTs as fetchRoutescanNFTs,
  supportsRoutescan,
} from "../../routescan";

/**
 * Account NFTs, from the first source that answers with something.
 *
 * Blockscout ships metadata with the holdings, so it leads; Routescan carries
 * chains Blockscout does not run and fills the metadata in from the chain
 * itself.
 */
export async function fetchAccountNFTs(
  chainId: number,
  accountAddress: string,
): Promise<NftCollection[]> {
  const sources = [
    { serves: await supportsBlockscout(chainId), fetch: fetchBlockscoutNFTs },
    { serves: supportsRoutescan(chainId), fetch: fetchRoutescanNFTs },
  ].filter((source) => source.serves);

  // Stays an error: the NFT sync prunes anything the source did not return, so
  // "nobody indexes this chain" must not read as "the account holds none"
  if (sources.length === 0) throw new Error("Chain not supported");

  let lastError: unknown;

  for (const { fetch } of sources) {
    try {
      const collections = await fetch(chainId, accountAddress);
      if (collections.length > 0) return collections;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;

  return [];
}
