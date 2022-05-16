import { ethers } from "ethers";
import { ERC20__factory } from "abi-types";

import { AccountAsset, TokenActivity, TokenStandard } from "core/types";
import {
  createAccountTokenKey,
  createTokenActivityKey,
  NATIVE_TOKEN_SLUG,
  parseTokenSlug,
} from "core/common/tokens";
import * as repo from "core/repo";

import { getRpcProvider } from "../../rpc";
import { debankApi, getDebankChain } from "../debank";
import BigNumber from "bignumber.js";

export const syncTokenActivities = async (
  chainId: number,
  accountAddress: string,
  tokenSlug: string
) => {
  try {
    const token = parseTokenSlug(tokenSlug);

    if (
      tokenSlug !== NATIVE_TOKEN_SLUG &&
      token.standard !== TokenStandard.ERC20
    )
      return;

    const accountToken = await repo.accountTokens.get(
      createAccountTokenKey({ chainId, accountAddress, tokenSlug })
    );
    if (!accountToken) return;

    const tokenActivities = new Map<string, TokenActivity>();
    const blockNumbers = new Set<number>();

    const addToActivities = (activity: TokenActivity) => {
      const dbKey = createTokenActivityKey(activity);
      const existing = tokenActivities.get(dbKey);

      if (!existing) {
        tokenActivities.set(dbKey, activity);
      } else if (activity.type === "transfer") {
        existing.amount = ethers.BigNumber.from(existing.amount)
          .add(activity.amount)
          .toString();
      }

      blockNumbers.add(activity.timeAt);
    };

    const debankChain = await getDebankChain(chainId);
    if (debankChain) {
      try {
        const { data } = await debankApi.get("/user/history_list", {
          params: {
            id: accountAddress,
            chain_id: debankChain.id,
            token_id:
              tokenSlug === NATIVE_TOKEN_SLUG
                ? debankChain.native_token_id
                : token.address,
            page_count: 50,
          },
        });

        const decimals = (accountToken as AccountAsset).decimals;

        for (const {
          id: txHash,
          sends,
          receives,
          token_approve,
          time_at,
        } of data.history_list) {
          const timeAt = time_at * 1_000;
          const base = {
            chainId,
            accountAddress,
            tokenSlug,
            txHash,
            timeAt,
          };

          for (const send of sends) {
            if (send.token_id === token.address) {
              addToActivities({
                ...base,
                type: "transfer",
                anotherAddress: send.to_addr,
                amount: new BigNumber(send.amount)
                  .times(decimals)
                  .times(-1)
                  .toString(),
              });
            }
          }

          for (const receive of receives) {
            if (receive.token_id === token.address) {
              addToActivities({
                ...base,
                type: "transfer",
                anotherAddress: receive.from_addr,
                amount: new BigNumber(receive.amount)
                  .times(decimals)
                  .toString(),
              });
            }
          }

          if (token_approve && token_approve.token_id === token.address) {
            const amount = new BigNumber(token_approve.amount).times(decimals);

            addToActivities({
              ...base,
              type: "approve",
              anotherAddress: token_approve.spender,
              amount: amount.toString(),
              clears: amount.isZero(),
            });
          }
        }

        await repo.tokenActivities.bulkPut(
          Array.from(tokenActivities.values()),
          Array.from(tokenActivities.keys())
        );

        return;
      } catch (err) {
        console.error(err);

        tokenActivities.clear();
        blockNumbers.clear();
      }
    }

    const provider = getRpcProvider(chainId);
    const erc20Token = ERC20__factory.connect(token.address, provider);

    const currentBlock = await provider.getBlockNumber();

    const transferOutTopic = erc20Token.filters.Transfer(accountAddress);
    const transferInTopic = erc20Token.filters.Transfer(null, accountAddress);
    const approvalTopic = erc20Token.filters.Approval(accountAddress);

    const step = 100_000;
    const limit = step * 5;
    let range = 0;

    while (range < limit) {
      const fromBlock = currentBlock - range - step;
      const toBlock = currentBlock - range;

      const [transfersOut, transfersIn, approvals] = await Promise.all([
        erc20Token.queryFilter(transferOutTopic, fromBlock, toBlock),
        erc20Token.queryFilter(transferInTopic, fromBlock, toBlock),
        erc20Token.queryFilter(approvalTopic, fromBlock, toBlock),
      ]);

      for (const tOut of transfersOut) {
        addToActivities({
          chainId,
          accountAddress,
          tokenSlug,
          txHash: tOut.transactionHash,
          timeAt: tOut.blockNumber,
          type: "transfer",
          anotherAddress: tOut.args[1],
          amount: ethers.BigNumber.from(tOut.args[2]).mul(-1).toString(),
        });
      }

      for (const tIn of transfersIn) {
        addToActivities({
          chainId,
          accountAddress,
          tokenSlug,
          txHash: tIn.transactionHash,
          timeAt: tIn.blockNumber,
          type: "transfer",
          anotherAddress: tIn.args[0],
          amount: ethers.BigNumber.from(tIn.args[2]).toString(),
        });
      }

      for (const approval of approvals) {
        const amount = ethers.BigNumber.from(approval.args[2]);

        addToActivities({
          chainId,
          accountAddress,
          tokenSlug,
          txHash: approval.transactionHash,
          timeAt: approval.blockNumber,
          type: "approve",
          anotherAddress: approval.args[1],
          amount: amount.toString(),
          clears: amount.isZero(),
        });
      }

      range += step;
    }

    const blocks: Record<number, ethers.providers.Block> = {};
    await Promise.all(
      Array.from(blockNumbers).map(async (number) => {
        try {
          blocks[number] = await provider.getBlock(number);
        } catch {}
      })
    );

    const values = Array.from(tokenActivities.values());
    const keys = Array.from(tokenActivities.keys());

    let i = tokenActivities.size;
    while (i-- > 0) {
      const item = values[i];
      if (item.timeAt in blocks) {
        item.timeAt = blocks[item.timeAt].timestamp;
      } else {
        values.slice(i, 1);
        keys.slice(i, 1);
      }
    }

    await repo.tokenActivities.bulkPut(values, keys);
  } catch (err) {
    console.error(err);
  }
};
