import { getAddress } from "ethers";
import BigNumber from "bignumber.js";

import { AccountToken, TokenActivityBase, TokenType } from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common/tokens";

import { indexerApi } from "../../indexer";
import { getLatestTokenActivity, prepareTokenActivitiesRepo } from "./utils";

/**
 * U-Indexer API Token Activities sync
 * Only for ERC20 tokens
 */
export async function syncUxTokenActivities(token: AccountToken) {
  const { chainId, tokenSlug, accountAddress, tokenType } = token;

  if (tokenType !== TokenType.Asset || tokenSlug === NATIVE_TOKEN_SLUG) return;

  const latestItem = await getLatestTokenActivity(token);
  const { address: tokenAddress } = parseTokenSlug(tokenSlug);

  const { data } = await indexerApi.get(
    `/u/v3/${chainId}/address/${accountAddress}/transactions`,
    {
      params: {
        _authAddress: accountAddress,
        contract: tokenAddress,
        pageSize: 100,
        ...(latestItem?.blockNumber
          ? {
              fromBlock: latestItem.blockNumber + 1,
            }
          : {}),
      },
    },
  );

  if (!data?.transactions?.length) return true;

  const { addToActivities, releaseToRepo } = prepareTokenActivitiesRepo();

  for (const item of data.transactions) {
    const txHash = item.id;
    const timeAt = item.date * 1_000;

    const base: Omit<TokenActivityBase, "type"> = {
      chainId,
      accountAddress,
      tokenSlug,
      txHash,
      pending: 0,
      timeAt,
      blockNumber: item.block,
    };

    for (const type of ["sent", "received"]) {
      for (const subItem of item[type] ?? []) {
        if (getAddress(subItem.token_id) !== tokenAddress) break;

        const projectName = getProjectName(item.description);
        if (projectName) {
          base.project = {
            name: projectName,
          };
        }

        if (getAddress(subItem.from) === accountAddress) {
          addToActivities({
            ...base,
            type: "transfer",
            anotherAddress: getAddress(subItem.to),
            amount: new BigNumber(subItem.value)
              .integerValue()
              .times(-1)
              .toString(),
          });
        } else if (getAddress(subItem.to) === accountAddress) {
          addToActivities({
            ...base,
            type: "transfer",
            anotherAddress: getAddress(subItem.from),
            amount: new BigNumber(subItem.value).integerValue().toString(),
          });
        }
      }
    }
  }

  await releaseToRepo();

  return true;
}

function getProjectName(txDescription: string) {
  try {
    if (txDescription.startsWith("Swapped on ")) {
      const parts = txDescription.split(":");

      if (parts.length > 1) {
        return parts[0].replace("Swapped on ", "");
      }
    }
  } catch (err) {
    console.warn("Failed to obtain project name", err);
  }

  return null;
}
