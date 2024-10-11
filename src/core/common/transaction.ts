import { ethers } from "ethers";
import { match, P } from "ts-pattern";
import { ERC20__factory, ERC721__factory, ERC1155__factory } from "abi-types";

import {
  ContractInteractionAction,
  TokenStandard,
  TxAction,
  TxActionType,
  TxParams,
} from "core/types";

import {
  createTokenSlug,
  isTokenStandardValid,
  NATIVE_TOKEN_SLUG,
} from "./tokens";

export function getGasPriceStep(averageGasPrice: bigint) {
  try {
    return BigInt(`1${"0".repeat(averageGasPrice.toString().length - 2)}`);
  } catch {
    return 1n;
  }
}

export async function matchTxAction(
  provider: ethers.Provider,
  txParams: Pick<TxParams, "to" | "data"> & { value?: ethers.BigNumberish },
): Promise<TxAction | null> {
  if (!txParams.to) {
    if (!isZeroHex(txParams.data)) {
      return {
        type: TxActionType.ContractDeployment,
      };
    }

    return null;
  }

  const destination = ethStringify(txParams.to);

  if (isZeroHex(txParams.data)) {
    return {
      type: TxActionType.TokenTransfer,
      toAddress: destination,
      tokens: [
        {
          slug: NATIVE_TOKEN_SLUG,
          amount: ethStringify(txParams.value ?? 0),
        },
      ],
    };
  }

  const getContractInteractionAction = (): ContractInteractionAction => ({
    type: TxActionType.ContractInteraction,
    contractAddress: destination,
    nativeTokenAmount:
      txParams.value && !isZeroHex(txParams.value)
        ? ethStringify(txParams.value)
        : undefined,
  });

  const parsedAll = parseStandardTokenTransactionData(txParams.data!);

  if (parsedAll.length === 0) {
    return getContractInteractionAction();
  }

  const parsed = await pickParsed(provider, destination, parsedAll);

  return (
    match<typeof parsed, TxAction | null>(parsed)
      // ERC20
      .with(
        [TokenStandard.ERC20, { name: "transfer" }],
        ([standard, { args }]) => ({
          type: TxActionType.TokenTransfer,
          toAddress: ethStringify(args[0]),
          tokens: [
            {
              slug: createTokenSlug({
                standard,
                address: destination,
                id: "0",
              }),
              amount: ethStringify(args[1]),
            },
          ],
        }),
      )
      .with(
        [TokenStandard.ERC20, { name: "approve" }],
        ([standard, { args }]) => ({
          type: TxActionType.TokenApprove,
          toAddress: ethStringify(args[0]),
          tokenSlug: createTokenSlug({
            standard,
            address: destination,
            id: "0",
          }),
          amount: ethStringify(args[1]),
          clears: isZeroHex(args[1]),
        }),
      )
      .with(
        [TokenStandard.ERC20, { name: "transferFrom" }],
        ([standard, { args }]) => ({
          type: TxActionType.TokenTransfer,
          toAddress: ethStringify(args[1]),
          tokens: [
            {
              slug: createTokenSlug({
                standard,
                address: destination,
                id: "0",
              }),
              amount: ethStringify(args[2]),
            },
          ],
          fromAddress: ethStringify(args[0]),
        }),
      )
      // ERC721
      .with(
        [TokenStandard.ERC721, { name: "safeTransferFrom" }],
        ([standard, { args }]) => ({
          type: TxActionType.TokenTransfer,
          toAddress: ethStringify(args[1]),
          tokens: [
            {
              slug: createTokenSlug({
                standard,
                address: destination,
                id: ethStringify(args[2]),
              }),
              amount: "1",
            },
          ],
          fromAddress: ethStringify(args[0]),
        }),
      )
      .with(
        [TokenStandard.ERC721, { name: "transferFrom" }],
        ([standard, { args }]) => ({
          type: TxActionType.TokenTransfer,
          toAddress: ethStringify(args[1]),
          tokens: [
            {
              slug: createTokenSlug({
                standard,
                address: destination,
                id: ethStringify(args[2]),
              }),
              amount: "1",
            },
          ],
          fromAddress: ethStringify(args[0]),
        }),
      )
      .with(
        [TokenStandard.ERC721, { name: "approve" }],
        ([standard, { args }]) => ({
          type: TxActionType.TokenApprove,
          toAddress: ethStringify(args[0]),
          tokenSlug: createTokenSlug({
            standard,
            address: destination,
            id: ethStringify(args[1]),
          }),
          clears: isZeroHex(args[0]),
        }),
      )
      .with(
        [TokenStandard.ERC721, { name: "setApprovalForAll", args: P.select() }],
        (args) => ({
          type: TxActionType.TokenApprove,
          toAddress: ethStringify(args[0]),
          clears: Boolean(args[1]),
          allTokensContract: txParams.to!,
        }),
      )
      // ERC1155
      .with(
        [
          TokenStandard.ERC1155,
          { name: "setApprovalForAll", args: P.select() },
        ],
        (args) => ({
          type: TxActionType.TokenApprove,
          toAddress: ethStringify(args[0]),
          clears: Boolean(args[1]),
          allTokensContract: txParams.to!,
        }),
      )
      .with(
        [TokenStandard.ERC1155, { name: "safeTransferFrom" }],
        ([standard, { args }]) => ({
          type: TxActionType.TokenTransfer,
          toAddress: ethStringify(args[1]),
          tokens: [
            {
              slug: createTokenSlug({
                standard,
                address: destination,
                id: ethStringify(args[2]),
              }),
              amount: ethStringify(args[3]),
            },
          ],
          fromAddress: ethStringify(args[0]),
          data: !isZeroHex(args[4]) ? ethStringify(args[4]) : undefined,
        }),
      )
      .with(
        [TokenStandard.ERC1155, { name: "safeBatchTransferFrom" }],
        ([standard, { args }]) => ({
          type: TxActionType.TokenTransfer,
          toAddress: ethStringify(args[1]),
          tokens: (args[2] as any[]).map((id, i) => ({
            slug: createTokenSlug({
              standard,
              address: destination,
              id: ethStringify(id),
            }),
            amount: ethStringify(args[3][i]),
          })),
          fromAddress: ethStringify(args[0]),
          data: !isZeroHex(args[4]) ? ethStringify(args[4]) : undefined,
        }),
      )
      // Etc...
      .otherwise(getContractInteractionAction)
  );
}

export async function matchTokenTransferEvents(
  provider: ethers.Provider,
  logs: {
    address: string;
    data: string;
    topics: string[];
  }[],
) {
  const results: {
    tokenSlug: string;
    from: string;
    to: string;
    amount: string;
  }[] = [];

  await Promise.all(
    logs.map(async (log) => {
      const parsedAll = parseStandardTokenEvent(log);

      if (parsedAll.length === 0) {
        return;
      }

      const address = ethStringify(log.address);
      const parsed = await pickParsed(provider, address, parsedAll);

      match(parsed)
        .with(
          [TokenStandard.ERC20, { name: "Transfer" }],
          ([standard, { args }]) => {
            results.push({
              tokenSlug: createTokenSlug({ standard, address, id: "0" }),
              from: ethStringify(args[0]),
              to: ethStringify(args[1]),
              amount: ethStringify(args[2]),
            });
          },
        )
        .with(
          [TokenStandard.ERC721, { name: "Transfer" }],
          ([standard, { args }]) => {
            results.push({
              tokenSlug: createTokenSlug({
                standard,
                address,
                id: ethStringify(args[2]),
              }),
              from: ethStringify(args[0]),
              to: ethStringify(args[1]),
              amount: "1",
            });
          },
        )
        .with(
          [TokenStandard.ERC1155, { name: "TransferSingle" }],
          ([standard, { args }]) => {
            results.push({
              tokenSlug: createTokenSlug({
                standard,
                address,
                id: ethStringify(args[3]),
              }),
              from: ethStringify(args[1]),
              to: ethStringify(args[2]),
              amount: ethStringify(args[4]),
            });
          },
        )
        .with(
          [TokenStandard.ERC1155, { name: "TransferBatch" }],
          ([standard, { args }]) => {
            const length = args[3].length;

            for (let i = 0; i < length; i++) {
              results.push({
                tokenSlug: createTokenSlug({
                  standard,
                  address,
                  id: ethStringify(args[3][i]),
                }),
                from: ethStringify(args[1]),
                to: ethStringify(args[2]),
                amount: ethStringify(args[4][i]),
              });
            }
          },
        )
        .otherwise(() => null);
    }),
  );

  return results;
}

const erc20Interface = ERC20__factory.createInterface();
const erc721Interface = ERC721__factory.createInterface();
const erc1155Interface = ERC1155__factory.createInterface();

export type ParsedTokenTxData = [
  TokenStandard.ERC20 | TokenStandard.ERC721 | TokenStandard.ERC1155,
  ethers.TransactionDescription | null,
];

export function parseStandardTokenTransactionData(
  data: string,
): ParsedTokenTxData[] {
  const parsed: ParsedTokenTxData[] = [];

  try {
    parsed.push([
      TokenStandard.ERC20,
      erc20Interface.parseTransaction({ data }),
    ]);
  } catch {
    // ignore and next try to parse with erc721 ABI
  }

  try {
    parsed.push([
      TokenStandard.ERC721,
      erc721Interface.parseTransaction({ data }),
    ]);
  } catch {
    // ignore and next try to parse with erc1155 ABI
  }

  try {
    parsed.push([
      TokenStandard.ERC1155,
      erc1155Interface.parseTransaction({ data }),
    ]);
  } catch {
    // ignore and return null
  }

  return parsed;
}

export type ParsedTokenEvent = [TokenStandard, ethers.LogDescription | null];

export function parseStandardTokenEvent(log: {
  topics: string[];
  data: string;
}): ParsedTokenEvent[] {
  const parsed: ParsedTokenEvent[] = [];

  try {
    parsed.push([TokenStandard.ERC20, erc20Interface.parseLog(log)]);
  } catch {
    // ignore and next try to parse with erc721 ABI
  }

  try {
    parsed.push([TokenStandard.ERC721, erc721Interface.parseLog(log)]);
  } catch {
    // ignore and next try to parse with erc1155 ABI
  }

  try {
    parsed.push([TokenStandard.ERC1155, erc1155Interface.parseLog(log)]);
  } catch {
    // ignore and return null
  }

  return parsed;
}

export async function isSmartContractAddress(
  provider: ethers.Provider,
  address: string,
) {
  let contractCode;
  try {
    contractCode = await provider.getCode(address);
  } catch {
    contractCode = null;
  }

  return (
    Boolean(contractCode) && contractCode !== "0x" && contractCode !== "0x0"
  );
}

async function pickParsed<T extends ParsedTokenTxData | ParsedTokenEvent>(
  provider: ethers.Provider,
  address: string,
  parsedAll: T[],
): Promise<T> {
  if (parsedAll.length > 1) {
    const valids = await Promise.all(
      parsedAll.map(([standard]) =>
        isTokenStandardValid(provider, address, standard),
      ),
    );

    for (let i = 0; i < parsedAll.length; i++) {
      const valid = valids[i];
      if (valid) {
        return parsedAll[i];
      }
    }
  }

  return parsedAll[0];
}

function ethStringify(v: ethers.BigNumberish) {
  return typeof v === "string" && ethers.isAddress(v)
    ? ethers.getAddress(v)
    : v.toString();
}

export function isZeroHex(val?: any) {
  val = val?.toHexString?.() ?? val?.toString?.();
  return !val || val === "0x" || val === "0x00" || val === ethers.ZeroAddress;
}
