import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import { AccountToken, TokenActivityBase, TokenType } from "core/types";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import { indexerApi, getDxChain } from "../../indexer";
import { getLatestTokenActivity, prepareTokenActivitiesRepo } from "./utils";

/**
 * D-Indexer API Token Activities sync
 * Only for native token
 */
export async function syncDxTokenActivities(token: AccountToken) {
  const { chainId, tokenSlug, accountAddress, tokenType } = token;

  if (tokenSlug !== NATIVE_TOKEN_SLUG) return;

  const dxChain = await getDxChain(chainId);
  if (!dxChain) return;

  const { addToActivities, releaseToRepo } = prepareTokenActivitiesRepo();

  const indexerTokenId = dxChain.native_token_id;
  const decimalsFactor = new BigNumber(10).pow(
    tokenType === TokenType.Asset ? token.decimals : 0,
  );

  const latestItem = await getLatestTokenActivity(token);

  const pageCount = 20;
  const maxRequests = latestItem ? 1 : 2;
  let startTime: number | undefined;

  for (let i = 0; i < maxRequests; i++) {
    const { data } = await indexerApi.get("/d/v1/user/history_list", {
      params: {
        _authAddress: accountAddress,
        id: accountAddress,
        chain_id: dxChain.id,
        token_id: indexerTokenId,
        page_count: pageCount,
        start_time: startTime,
      },
    });

    const txs = data?.history_list;

    if (!Array.isArray(txs) || txs.length === 0) {
      break;
    }

    let finished = false;

    for (const {
      id: txHash,
      sends,
      receives,
      token_approve,
      time_at,
      project_id,
    } of txs) {
      const timeAt = time_at * 1_000;

      if (latestItem && latestItem.timeAt >= timeAt) {
        finished = true;
        break;
      }

      const base: Omit<TokenActivityBase, "type"> = {
        chainId,
        accountAddress,
        tokenSlug,
        txHash,
        pending: 0,
        timeAt,
      };

      if (project_id) {
        const project = data.project_dict[project_id];
        if (project) {
          base.project = {
            name: project.name,
            logoUrl: project.logo_url,
            siteUrl: project.site_url,
          };
        }
      }

      let sendOrReceiveAdded = false;

      for (const send of sends) {
        if (send.token_id === indexerTokenId) {
          sendOrReceiveAdded = true;

          addToActivities({
            ...base,
            type: "transfer",
            anotherAddress: ethers.getAddress(send.to_addr),
            amount: new BigNumber(send.amount)
              .times(decimalsFactor)
              .integerValue()
              .times(-1)
              .toString(),
          });
        }
      }

      for (const receive of receives) {
        if (receive.token_id === indexerTokenId) {
          sendOrReceiveAdded = true;

          addToActivities({
            ...base,
            type: "transfer",
            anotherAddress: ethers.getAddress(receive.from_addr),
            amount: new BigNumber(receive.amount)
              .times(decimalsFactor)
              .integerValue()
              .toString(),
          });
        }
      }

      if (
        !sendOrReceiveAdded &&
        token_approve &&
        token_approve.token_id === indexerTokenId
      ) {
        const amount = new BigNumber(token_approve.value)
          .times(decimalsFactor)
          .integerValue();

        addToActivities({
          ...base,
          type: "approve",
          anotherAddress: ethers.getAddress(token_approve.spender),
          amount: amount.toString(),
          clears: amount.isZero(),
        });
      }
    }

    if (finished) {
      break;
    } else {
      startTime = txs[txs.length - 1].time_at;
    }
  }

  await releaseToRepo();

  return true;
}
