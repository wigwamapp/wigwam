import memoize from "mem";

import { indexerApi } from "core/common/indexerApi";

export const getDxChain = memoize(async (chainId: number) => {
  try {
    const chainList = await fetchDxChainList();

    return chainList.find((c) => c.community_id === chainId);
  } catch (err) {
    console.error(err);
    return undefined;
  }
});

export const fetchDxChainList = memoize(
  () => indexerApi.get<DxChain[]>("/d/v1/chain/list").then((r) => r.data),
  {
    maxAge: 60 * 60_000, // 1 hour
  },
);

export interface DxChain {
  id: string;
  community_id: number;
  name: string;
  native_token_id: string;
  logo_url: string;
  wrapped_token_id: string;
  is_support_pre_exec: boolean;
}
