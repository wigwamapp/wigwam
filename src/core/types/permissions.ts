export interface Permission {
  id: string;
  origin: string;
  timeAt: number;
  accountAddresses: string[];
  chainId: number;
  selectedAddress: string;
}
