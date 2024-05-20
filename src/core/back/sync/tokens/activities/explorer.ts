import { getAddress } from "ethers";
import BigNumber from "bignumber.js";
import axios from "axios";
import { createQueue } from "lib/system/queue";

import { AccountToken, TokenStandard, TokenType } from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common/tokens";
import { getNetwork } from "core/common/network";

import { getLatestTokenActivity, prepareTokenActivitiesRepo } from "./utils";

/**
 * Explorer (etherscan) Token Activities sync
 * For ERC20 tokens, For NFTS, and for native token as default 'txlist'
 */
export async function syncExplorerTokenActivities(token: AccountToken) {
  const { chainId, tokenSlug, accountAddress, tokenType } = token;

  const { explorerApiUrl } = await getNetwork(chainId);
  if (!explorerApiUrl) return;

  const nativeToken = tokenSlug === NATIVE_TOKEN_SLUG;
  const {
    standard,
    address: tokenAddress,
    id: tokenId,
  } = parseTokenSlug(tokenSlug);

  const latestItem = await getLatestTokenActivity(token);

  const action = (() => {
    if (nativeToken) return "txlist";
    if (standard === TokenStandard.ERC721) return "tokennfttx";
    if (standard === TokenStandard.ERC1155) return "token1155tx";

    return "tokentx"; // For ERC20
  })();

  const { data } = await withExplorerApiRequest(() =>
    axios({
      baseURL: explorerApiUrl,
      params: {
        module: "account",
        action,
        ...(nativeToken ? {} : { contractaddress: tokenAddress }),
        address: accountAddress,
        sort: "desc",
        page: 1,
        offset: 500,
      },
    }).then((res) => {
      if (res.data?.message === "NOTOK") {
        throw new Error(res.data.result);
      }

      return res;
    }),
  );

  let txs = data.result;

  if (!txs || txs.length === 0) return true;

  if (tokenType === TokenType.NFT) {
    txs = txs.filter((t: any) => t.tokenID === tokenId);
  }

  const { addToActivities, releaseToRepo } = prepareTokenActivitiesRepo();

  const base = {
    chainId,
    accountAddress,
    tokenSlug,
    pending: 0,
  };

  for (const tx of txs) {
    const timeAt = new BigNumber(tx.timeStamp).times(1_000).toNumber();

    if (latestItem && latestItem.timeAt >= timeAt) {
      break;
    }

    if (tx.value === "0" || tx.blockHash === "" || tx.isError === "1") {
      continue;
    }

    const [fromAddress, toAddress] = [tx.from, tx.to].map(
      (a) => a && getAddress(a),
    );
    if (!fromAddress || !toAddress) continue;

    const income = accountAddress === toAddress;
    const value = tx.value || tx.tokenValue || "1";

    addToActivities({
      ...base,
      timeAt,
      txHash: tx.hash,
      type: "transfer",
      anotherAddress: income ? fromAddress : toAddress,
      amount: (BigInt(value) * (income ? 1n : -1n)).toString(),
    });
  }

  await releaseToRepo();

  return true;
}

const enqueueExplorerApiRequest = createQueue();
let explorerApiLimitTime: number | undefined;

function withExplorerApiRequest<T>(factory: () => Promise<T>) {
  return enqueueExplorerApiRequest(async () => {
    if (explorerApiLimitTime) {
      await new Promise((res) =>
        setTimeout(res, explorerApiLimitTime! - Date.now()),
      );
    }

    return factory().finally(() => {
      explorerApiLimitTime = Date.now() + 5_000;
    });
  });
}
