import { ethers, getAddress } from "ethers";
import BigNumber from "bignumber.js";
import { ERC20__factory } from "abi-types";

import * as repo from "core/repo";
import { AccountToken, TokenStandard } from "core/types";
import { parseTokenSlug } from "core/common/tokens";

import { getRpcProvider } from "../../../rpc";
import { prepareTokenActivitiesRepo } from "./utils";

const GET_LOGS_ENABLED = false;
// TODO: Add last checked block using storage

/**
 * On-chain Token Activities sync
 * For ERC20 tokens
 */
export async function syncChainTokenActivities(token: AccountToken) {
  const { chainId, tokenSlug, accountAddress, tokenType } = token;
  const { standard, address: tokenAddress } = parseTokenSlug(tokenType);

  if (!GET_LOGS_ENABLED) return;
  if (standard !== TokenStandard.ERC20) return;

  const provider = getRpcProvider(chainId);
  const erc20Token = ERC20__factory.connect(tokenAddress, provider);

  const currentBlock = await provider.getBlockNumber();

  const transferOutTopic = erc20Token.filters.Transfer(accountAddress);
  const transferInTopic = erc20Token.filters.Transfer(
    undefined,
    accountAddress,
  );
  const approvalTopic = erc20Token.filters.Approval(accountAddress);

  const { addToActivities, getCurrentState } = prepareTokenActivitiesRepo();

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
        anotherAddress: getAddress(tOut.args[1]),
        amount: (BigInt(tOut.args[2]) * -1n).toString(),
      });
    }

    for (const tIn of transfersIn) {
      addToActivities({
        ...base,
        txHash: tIn.transactionHash,
        timeAt: tIn.blockNumber,
        type: "transfer",
        anotherAddress: getAddress(tIn.args[0]),
        amount: BigInt(tIn.args[2]).toString(),
      });
    }

    for (const approval of approvals) {
      const amount = BigInt(approval.args[2]);

      addToActivities({
        ...base,
        txHash: approval.transactionHash,
        timeAt: approval.blockNumber,
        type: "approve",
        anotherAddress: getAddress(approval.args[1]),
        amount: amount.toString(),
        clears: amount === 0n,
      });
    }

    range += step;
  }

  const { tokenActivities, blockNumbers } = getCurrentState();

  const blocks: Record<number, ethers.Block | null> = {};
  await Promise.all(
    Array.from(blockNumbers).map(async (number) => {
      try {
        blocks[number] = await provider.getBlock(number);
      } catch {}
    }),
  );

  const values = Array.from(tokenActivities.values());
  const keys = Array.from(tokenActivities.keys());

  let i = tokenActivities.size;
  while (i-- > 0) {
    const item = values[i];
    if (blocks[item.timeAt]) {
      item.timeAt = new BigNumber(blocks[item.timeAt]!.timestamp)
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

  return true;
}
