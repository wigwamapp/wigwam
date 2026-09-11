export interface Permission {
  origin: string;
  timeAt: number;
  id: string;
  chainId: number;
  accountAddresses: string[];
}

/**
 * A site the user chose to proceed with after it could not be recognized.
 * Kept apart from `Permission`: the decision outlives any single connection
 * and survives the user disconnecting the site.
 */
export interface TrustedDapp {
  origin: string;
  timeAt: number;
}
