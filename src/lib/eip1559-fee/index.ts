import { ethers } from "ethers";
import { ema } from "moving-averages";
import {
  BASE_FEE_ADDITIONAL_PADDING,
  BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS,
} from "./constants";
import {
  FeeHistoryResponse,
  MaxFeeSuggestions,
  MaxPriorityFeeSuggestions,
  Suggestions,
} from "./entities";
import {
  calculateBaseFeeTrend,
  getOutlierBlocksToRemove,
  gweiToWei,
  multiply,
  rewardsFilterOutliers,
  suggestBaseFee,
  weiToGweiNumber,
  weiToString,
} from "./utils";

export const suggestMaxBaseFee = async (
  provider: ethers.JsonRpcApiProvider,
  fromBlock = "latest",
  blockCountHistory = 100,
): Promise<MaxFeeSuggestions> => {
  const feeHistory: FeeHistoryResponse = await provider.send("eth_feeHistory", [
    ethers.stripZerosLeft(ethers.toBeHex(blockCountHistory)),
    fromBlock,
    [],
  ]);
  const currentBaseFee = weiToString(
    feeHistory?.baseFeePerGas[feeHistory?.baseFeePerGas.length - 1],
  );
  const baseFees: number[] = [];
  const order: number[] = [];
  for (let i = 0; i < feeHistory.baseFeePerGas.length; i++) {
    baseFees.push(weiToGweiNumber(feeHistory.baseFeePerGas[i]));
    order.push(i);
  }
  const baseFeeTrend = calculateBaseFeeTrend(baseFees, currentBaseFee);

  baseFees[baseFees.length - 1] *= 9 / 8;
  for (let i = feeHistory.gasUsedRatio.length - 1; i >= 0; i--) {
    if (feeHistory.gasUsedRatio[i] > 0.9) {
      baseFees[i] = baseFees[i + 1];
    }
  }
  order.sort((a, b) => {
    const aa = baseFees[a];
    const bb = baseFees[b];
    if (aa < bb) {
      return -1;
    }
    if (aa > bb) {
      return 1;
    }
    return 0;
  });
  const result: number[] = [];
  let maxBaseFee = 0;
  for (let timeFactor = 15; timeFactor >= 0; timeFactor--) {
    let bf = suggestBaseFee(baseFees, order, timeFactor, 0.1, 0.3);
    if (bf > maxBaseFee) {
      maxBaseFee = bf;
    } else {
      bf = maxBaseFee;
    }
    result[timeFactor] = bf;
  }
  const baseFeeSuggestion = gweiToWei(
    multiply(Math.max(...result), BASE_FEE_ADDITIONAL_PADDING),
  );

  const blocksToConfirmationByBaseFee = {
    120: multiply(
      baseFeeSuggestion,
      BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[120],
    ).toFixed(0),
    240: multiply(
      baseFeeSuggestion,
      BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[240],
    ).toFixed(0),
    4: multiply(
      baseFeeSuggestion,
      BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[4],
    ).toFixed(0),
    40: multiply(
      baseFeeSuggestion,
      BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[40],
    ).toFixed(0),
    8: multiply(
      baseFeeSuggestion,
      BASE_FEE_BLOCKS_TO_CONFIRMATION_MULTIPLIERS[8],
    ).toFixed(0),
  };

  return {
    baseFeeSuggestion,
    baseFeeTrend,
    blocksToConfirmationByBaseFee,
    currentBaseFee,
  };
};
export const suggestMaxPriorityFee = async (
  provider: ethers.JsonRpcApiProvider,
  fromBlock = "latest",
): Promise<MaxPriorityFeeSuggestions> => {
  const feeHistory: FeeHistoryResponse = await provider.send("eth_feeHistory", [
    ethers.stripZerosLeft(ethers.toBeHex(10)),
    fromBlock,
    [10, 15, 30, 45],
  ]);
  const blocksRewards = feeHistory.reward;

  if (!blocksRewards.length) throw new Error("Error: block reward was empty");

  const outlierBlocks = getOutlierBlocksToRemove(blocksRewards, 0);

  const blocksRewardsPerc10 = rewardsFilterOutliers(
    blocksRewards,
    outlierBlocks,
    0,
  );
  const blocksRewardsPerc15 = rewardsFilterOutliers(
    blocksRewards,
    outlierBlocks,
    1,
  );
  const blocksRewardsPerc30 = rewardsFilterOutliers(
    blocksRewards,
    outlierBlocks,
    2,
  );
  const blocksRewardsPerc45 = rewardsFilterOutliers(
    blocksRewards,
    outlierBlocks,
    3,
  );

  const emaPerc10 = ema(blocksRewardsPerc10, blocksRewardsPerc10.length)[
    blocksRewardsPerc10.length - 1
  ];
  const emaPerc15 = ema(blocksRewardsPerc15, blocksRewardsPerc15.length)[
    blocksRewardsPerc15.length - 1
  ];
  const emaPerc30 = ema(blocksRewardsPerc30, blocksRewardsPerc30.length)[
    blocksRewardsPerc30.length - 1
  ];
  const emaPerc45 = ema(blocksRewardsPerc45, blocksRewardsPerc45.length)[
    blocksRewardsPerc45.length - 1
  ];

  if (
    emaPerc10 === undefined ||
    emaPerc15 === undefined ||
    emaPerc30 === undefined ||
    emaPerc45 === undefined
  )
    throw new Error("Error: ema was undefined");

  const boundedNormalPriorityFee = Math.min(Math.max(emaPerc15, 1), 1.8);
  const boundedFastMaxPriorityFee = Math.min(Math.max(emaPerc30, 1.5), 3);
  const boundedUrgentPriorityFee = Math.min(Math.max(emaPerc45, 2), 9);

  return {
    blocksToConfirmationByPriorityFee: {
      1: gweiToWei(emaPerc45),
      2: gweiToWei(emaPerc30),
      3: gweiToWei(emaPerc15),
      4: gweiToWei(emaPerc10),
    },
    confirmationTimeByPriorityFee: {
      15: gweiToWei(emaPerc45),
      30: gweiToWei(emaPerc30),
      45: gweiToWei(emaPerc15),
      60: gweiToWei(emaPerc10),
    },
    maxPriorityFeeSuggestions: {
      fast: gweiToWei(boundedFastMaxPriorityFee),
      normal: gweiToWei(boundedNormalPriorityFee),
      urgent: gweiToWei(boundedUrgentPriorityFee),
    },
  };
};
export const suggestFees = async (
  provider: ethers.JsonRpcApiProvider,
): Promise<Suggestions> => {
  const {
    baseFeeSuggestion,
    baseFeeTrend,
    currentBaseFee,
    blocksToConfirmationByBaseFee,
  } = await suggestMaxBaseFee(provider);
  const {
    maxPriorityFeeSuggestions,
    confirmationTimeByPriorityFee,
    blocksToConfirmationByPriorityFee,
  } = await suggestMaxPriorityFee(provider);

  return {
    baseFeeSuggestion,
    baseFeeTrend,
    blocksToConfirmationByBaseFee,
    blocksToConfirmationByPriorityFee,
    confirmationTimeByPriorityFee,
    currentBaseFee,
    maxPriorityFeeSuggestions,
  };
};
