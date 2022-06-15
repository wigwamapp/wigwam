import { ethers } from "ethers";
import memoize from "mem";
import BigNumber from "bignumber.js";
import { ERC20__factory } from "abi-types";
import { createQueue } from "lib/system/queue";

import {
  AccountAsset,
  TokenActivity,
  TokenActivityBase,
  TokenStandard,
} from "core/types";
import {
  createAccountTokenKey,
  createTokenActivityKey,
  NATIVE_TOKEN_SLUG,
  parseTokenSlug,
} from "core/common/tokens";
import * as repo from "core/repo";

import { getRpcProvider } from "../../rpc";
import { debankApi, getDebankChain } from "../debank";
import { getMyRandomAddress } from "../_randomAddresses";

const GET_LOGS_ENABLED = false;

const enqueue = createQueue();

export const syncTokenActivities = memoize(
  (chainId: number, accountAddress: string, tokenSlug: string) =>
    enqueue(async () => {
      try {
        const tpAddress = await getMyRandomAddress(accountAddress, chainId);

        const token = parseTokenSlug(tokenSlug);

        if (
          ![TokenStandard.Native, TokenStandard.ERC20].includes(token.standard)
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
            const debankTokenId =
              tokenSlug === NATIVE_TOKEN_SLUG
                ? debankChain.native_token_id
                : token.address.toLowerCase();

            const { data } = await debankApi.get("/user/history_list", {
              params: {
                id: tpAddress,
                chain_id: debankChain.id,
                token_id: debankTokenId,
                page_count: 50,
              },
            });

            const decimalsFactor = new BigNumber(10).pow(
              (accountToken as AccountAsset).decimals
            );

            for (const {
              id: txHash,
              sends,
              receives,
              token_approve,
              time_at,
              project_id,
            } of data.history_list) {
              const timeAt = time_at * 1_000;
              const base: Omit<TokenActivityBase, "type"> = {
                chainId,
                accountAddress,
                tokenSlug,
                txHash,
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
                if (send.token_id === debankTokenId) {
                  sendOrReceiveAdded = true;
                  addToActivities({
                    ...base,
                    type: "transfer",
                    anotherAddress: ethers.utils.getAddress(send.to_addr),
                    amount: new BigNumber(send.amount)
                      .times(decimalsFactor)
                      .integerValue()
                      .times(-1)
                      .toString(),
                  });
                }
              }

              for (const receive of receives) {
                if (receive.token_id === debankTokenId) {
                  sendOrReceiveAdded = true;
                  addToActivities({
                    ...base,
                    type: "transfer",
                    anotherAddress: ethers.utils.getAddress(receive.from_addr),
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
                token_approve.token_id === debankTokenId
              ) {
                console.info({
                  id: txHash,
                  sends,
                  receives,
                  token_approve,
                  time_at,
                  project_id,
                });

                const amount = new BigNumber(token_approve.value)
                  .times(decimalsFactor)
                  .integerValue();

                addToActivities({
                  ...base,
                  type: "approve",
                  anotherAddress: ethers.utils.getAddress(
                    token_approve.spender
                  ),
                  amount: amount.toString(),
                  clears: amount.isZero(),
                });
              }
            }

            if (tokenActivities.size > 0) {
              await repo.tokenActivities.bulkPut(
                Array.from(tokenActivities.values()),
                Array.from(tokenActivities.keys())
              );
            }

            return;
          } catch (err) {
            console.error(err);

            tokenActivities.clear();
            blockNumbers.clear();
          }
        }

        if (!GET_LOGS_ENABLED) return;
        if (token.standard !== TokenStandard.ERC20) return;

        const provider = getRpcProvider(chainId);
        const erc20Token = ERC20__factory.connect(token.address, provider);

        const currentBlock = await provider.getBlockNumber();

        const transferOutTopic = erc20Token.filters.Transfer(tpAddress);
        const transferInTopic = erc20Token.filters.Transfer(null, tpAddress);
        const approvalTopic = erc20Token.filters.Approval(tpAddress);

        const step = 3_500 - 1;
        const limit = step * 10;
        let range = 0;

        const base = {
          chainId,
          accountAddress,
          tokenSlug,
        };

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
              ...base,
              txHash: tOut.transactionHash,
              timeAt: tOut.blockNumber,
              type: "transfer",
              anotherAddress: ethers.utils.getAddress(tOut.args[1]),
              amount: ethers.BigNumber.from(tOut.args[2]).mul(-1).toString(),
            });
          }

          for (const tIn of transfersIn) {
            addToActivities({
              ...base,
              txHash: tIn.transactionHash,
              timeAt: tIn.blockNumber,
              type: "transfer",
              anotherAddress: ethers.utils.getAddress(tIn.args[0]),
              amount: ethers.BigNumber.from(tIn.args[2]).toString(),
            });
          }

          for (const approval of approvals) {
            const amount = ethers.BigNumber.from(approval.args[2]);

            addToActivities({
              ...base,
              txHash: approval.transactionHash,
              timeAt: approval.blockNumber,
              type: "approve",
              anotherAddress: ethers.utils.getAddress(approval.args[1]),
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

        if (values.length > 0) {
          await repo.tokenActivities.bulkPut(values, keys);
        }
      } catch (err) {
        console.error(err);
      }
    }),
  {
    maxAge: 60_000,
    cacheKey: (args) => args.join("_"),
  }
);
