import { ethers } from "ethers";
import axios from "axios";
import memoize from "mem";
import BigNumber from "bignumber.js";
import { ERC20__factory } from "abi-types";
import { createQueue } from "lib/system/queue";

import {
  TokenActivity,
  TokenActivityBase,
  TokenStandard,
  TokenType,
} from "core/types";
import { getNetwork } from "core/common";
import {
  createAccountTokenKey,
  createTokenActivityKey,
  NATIVE_TOKEN_SLUG,
  parseTokenSlug,
} from "core/common/tokens";
import * as repo from "core/repo";

import { getRpcProvider } from "../../rpc";
import { getDebankChain } from "../debank";
import { synced, syncStarted } from "core/back/state";

const GET_LOGS_ENABLED = true;

export const syncTokenActivities = memoize(
  async (chainId: number, accountAddress: string, tokenSlug: string) => {
    const accTokenKey = createAccountTokenKey({
      chainId,
      accountAddress,
      tokenSlug,
    });

    syncStarted(accTokenKey);

    try {
      await performTokenActivitiesSync(
        accTokenKey,
        chainId,
        accountAddress,
        tokenSlug
      );
    } catch (err) {
      console.error(err);
    }

    synced(accTokenKey);
  },
  {
    maxAge: 40_000,
    cacheKey: (args) => args.join("_"),
  }
);

async function performTokenActivitiesSync(
  accTokenKey: string,
  chainId: number,
  accountAddress: string,
  tokenSlug: string
) {
  const token = parseTokenSlug(tokenSlug);

  const accountToken = await repo.accountTokens.get(accTokenKey);
  if (!accountToken) return;

  const decimalsFactor = new BigNumber(10).pow(
    accountToken.tokenType === TokenType.Asset ? accountToken.decimals : 0
  );

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

  const getLatestItem = () =>
    repo.tokenActivities
      .where("[chainId+accountAddress+tokenSlug+pending]")
      .equals([chainId, accountAddress, tokenSlug, 0])
      .reverse()
      .first();

  /**
   * Debank sync
   */

  const debankChain = await getDebankChain(chainId);

  if (debankChain) {
    const debankTokenId = (() => {
      if (tokenSlug === NATIVE_TOKEN_SLUG) return debankChain.native_token_id;

      if (accountToken.tokenType === TokenType.Asset)
        return token.address.toLowerCase();

      return accountToken.tpId;
    })();

    if (debankTokenId) {
      try {
        const latestItem = await getLatestItem();

        const pageCount = 20;
        const maxRequests = latestItem ? 10 : 5;
        let startTime: number | undefined;

        for (let i = 0; i < maxRequests; i++) {
          const { data } = await axios
            .get("https://api.debank.com/history/list", {
              timeout: 60_000,
              params: {
                user_addr: accountAddress,
                chain: debankChain.id,
                token_id: debankTokenId,
                page_count: pageCount,
                start_time: startTime,
              },
            })
            .then((res) => res.data);

          const txs = data.history_list;

          if (txs.length === 0) {
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
              const amount = new BigNumber(token_approve.value)
                .times(decimalsFactor)
                .integerValue();

              addToActivities({
                ...base,
                type: "approve",
                anotherAddress: ethers.utils.getAddress(token_approve.spender),
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

        if (tokenActivities.size > 0) {
          await repo.tokenActivities.bulkPut(
            Array.from(tokenActivities.values()),
            Array.from(tokenActivities.keys())
          );
        }

        return;
      } catch (err) {
        console.error(err);
      }
    }
  }

  /**
   * Explorer sync
   */

  const { explorerApiUrl } = await getNetwork(chainId);

  if (explorerApiUrl) {
    const nativeToken = token.standard === TokenStandard.Native;
    const latestItem = await getLatestItem();

    const action = (() => {
      if (nativeToken) return "txlist";
      if (token.standard === TokenStandard.ERC721) return "tokennfttx";
      if (token.standard === TokenStandard.ERC1155) return "token1155tx";

      return "tokentx"; // For ERC20
    })();

    const res = await withExplorerApiRequest(() =>
      axios({
        baseURL: explorerApiUrl,
        params: {
          module: "account",
          action,
          ...(nativeToken ? {} : { contractaddress: token.address }),
          address: accountAddress,
          sort: "desc",
          page: 1,
          offset: 200,
        },
      })
    );

    let txs = res.data.result;

    if (!txs || txs.length === 0) {
      return;
    }

    if (accountToken.tokenType === TokenType.NFT) {
      txs = txs.filter((t: any) => t.tokenID === token.id);
    }

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
        (a) => a && ethers.utils.getAddress(a)
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
        amount: ethers.BigNumber.from(value)
          .mul(income ? 1 : -1)
          .toString(),
      });
    }

    if (tokenActivities.size > 0) {
      await repo.tokenActivities.bulkPut(
        Array.from(tokenActivities.values()),
        Array.from(tokenActivities.keys())
      );
    }

    return;
  }

  /**
   * Chain sync (only for custom tokens)
   */

  if (!GET_LOGS_ENABLED) return;
  if (token.standard !== TokenStandard.ERC20) return;

  const provider = getRpcProvider(chainId);
  const erc20Token = ERC20__factory.connect(token.address, provider);

  const currentBlock = await provider.getBlockNumber();

  const transferOutTopic = erc20Token.filters.Transfer(accountAddress);
  const transferInTopic = erc20Token.filters.Transfer(null, accountAddress);
  const approvalTopic = erc20Token.filters.Approval(accountAddress);

  const step = 1_000 - 1;
  const limit = step * 30;
  let range = 0;

  const base = {
    chainId,
    accountAddress,
    tokenSlug,
    pending: 0,
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
      item.timeAt = new BigNumber(blocks[item.timeAt].timestamp)
        .times(1_000)
        .toNumber();
    } else {
      values.slice(i, 1);
      keys.slice(i, 1);
    }
  }

  if (values.length > 0) {
    await repo.tokenActivities.bulkPut(values, keys);
  }
}

const enqueueExplorerApiRequest = createQueue();
let explorerApiLimitTime: number | undefined;

function withExplorerApiRequest<T>(factory: () => Promise<T>) {
  return enqueueExplorerApiRequest(async () => {
    if (explorerApiLimitTime) {
      await new Promise((res) =>
        setTimeout(res, explorerApiLimitTime! - Date.now())
      );
    }

    explorerApiLimitTime = Date.now() + 5_000;

    return factory();
  });
}
