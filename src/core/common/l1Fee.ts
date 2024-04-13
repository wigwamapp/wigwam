import {
  BigNumberish,
  Transaction,
  TransactionRequest,
  getBytes,
  resolveAddress,
  toBeHex,
} from "ethers";
import retry from "async-retry";
import { L1GasOracle__factory } from "abi-types";

import { ClientProvider } from "core/client";

const OVM_FEE_ORACLE = "0x420000000000000000000000000000000000000F";
const L1_FEE_ORACLE = new Map([
  // Optimism
  [10, OVM_FEE_ORACLE], // Optimism
  [8453, OVM_FEE_ORACLE], // Base
  [7777777, OVM_FEE_ORACLE], // Zore,
  [252, OVM_FEE_ORACLE], // Fraxtal,
  // Rollup
  [534352, "0x5300000000000000000000000000000000000002"], // Scroll,
]);
const L1_FEE_CHAIN_IDS = new Set([
  ...L1_FEE_ORACLE.keys(),
  204, // ObBNB
]);

const GAS_UNIT = {
  basicTx: 21_000,
  basicTransfer: 50_000,
};

export const estimateL1Fee = async (
  provider: ClientProvider,
  txReq: TransactionRequest & { gas?: string },
  l2GasPrice?: BigNumberish,
): Promise<bigint | null> => {
  // Skip for non optimism or rollup like chains
  if (!L1_FEE_CHAIN_IDS.has(provider.chainId)) {
    return null;
  }

  // Make safe copy
  const tx = { ...txReq } as typeof txReq & { to?: string; from?: string };

  try {
    // Format params

    if (tx?.value) {
      tx.value = toBeHex(tx.value);
    }

    if (tx?.from) {
      const nonce = await provider.getTransactionCount(tx.from);
      tx.nonce = Number(nonce);
      delete tx.from;
    }

    if (tx.gas) {
      delete tx.gas;
    }

    if (tx.to) {
      tx.to = await resolveAddress(tx.to);
    }

    if (!tx.gasLimit) {
      tx.gasLimit = toBeHex(
        !tx.data || tx.data === "0x"
          ? GAS_UNIT.basicTx
          : GAS_UNIT.basicTransfer,
      );
    }

    if (l2GasPrice) {
      tx.gasPrice = l2GasPrice;
    }

    // Estimate L1 fee

    if (L1_FEE_ORACLE.has(provider.chainId)) {
      // Fetch from contract
      const contract = L1GasOracle__factory.connect(
        L1_FEE_ORACLE.get(provider.chainId)!,
        provider,
      );

      const serializedTx = Transaction.from(tx).unsignedSerialized;

      return await retry(() => contract.getL1Fee(serializedTx), {
        retries: 2,
        minTimeout: 0,
        maxTimeout: 0,
      });
    } else if (provider.chainId === 204) {
      // ObBNB, custom estimation
      // @see https://docs.bnbchain.org/opbnb-docs/docs/faq/gas-and-fees-faqs

      // TODO: Use another dynamic source, because currently it fixed to 3
      // const bnbL1Fees = await suggestFees(getClientProvider(56));
      // const l1GasPrice = bnbL1Fees.modes.average.max;

      const l1GasPrice = 3n * 10n ** 9n;
      const fixedOverhead = 2100n;
      const dynamicOverhead = 1n;

      const serializedTx = Transaction.from(tx).unsignedSerialized;
      const txBytes = getBytes(serializedTx);

      const zeroBytes = countZeroBytes(txBytes);
      const nonZeroBytes = txBytes.length - zeroBytes;

      const txDataFas = BigInt(zeroBytes) * 4n + BigInt(nonZeroBytes) * 16n;

      const pure = l1GasPrice * (txDataFas + fixedOverhead) * dynamicOverhead;

      // Basic on statistics adjust to real one
      return (pure * 2n) / 3n;
    }
  } catch (err) {
    console.error(err);
  }

  return null;
};

function countZeroBytes(payload: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < payload.length; i++) {
    if (payload[i] === 0) {
      count++;
    }
  }
  return count;
}
