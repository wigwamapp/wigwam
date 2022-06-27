import { ethers } from "ethers";
import { TransactionDescription } from "@ethersproject/abi";
import { Provider } from "@ethersproject/abstract-provider";
import { match, P } from "ts-pattern";
import { ERC20__factory, ERC721__factory, ERC1155__factory } from "abi-types";

import {
  ContractInteractionAction,
  TokenStandard,
  TxAction,
  TxActionType,
  TxParams,
} from "core/types";

import { createTokenSlug, NATIVE_TOKEN_SLUG } from "./tokens";

export function matchTxAction(txParams: TxParams): TxAction | null {
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

  const parsed = parseStandardTokenTransactionData(txParams.data!);

  if (!parsed) {
    return getContractInteractionAction();
  }

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
        })
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
        })
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
        })
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
        })
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
        })
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
        })
      )
      .with(
        [TokenStandard.ERC721, { name: "setApprovalForAll", args: P.select() }],
        (args) => ({
          type: TxActionType.TokenApprove,
          toAddress: ethStringify(args[0]),
          clears: Boolean(args[1]),
          allTokensContract: txParams.to!,
        })
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
        })
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
        })
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
        })
      )
      // Etc...
      .otherwise(getContractInteractionAction)
  );
}

export function matchTokenTransferEvents(
  logs: {
    address: string;
    data: string;
    topics: string[];
  }[]
) {
  const results: {
    tokenSlug: string;
    from: string;
    to: string;
    amount: string;
  }[] = [];

  for (const log of logs) {
    const event = parseStandardTokenEvent(log);

    if (event) {
      const address = ethStringify(log.address);

      match(event)
        .with(
          [TokenStandard.ERC20, { name: "Transfer" }],
          ([standard, { args }]) => {
            results.push({
              tokenSlug: createTokenSlug({ standard, address, id: "0" }),
              from: ethStringify(args[0]),
              to: ethStringify(args[1]),
              amount: ethStringify(args[2]),
            });
          }
        )
        // TODO: Implement for all token standards;
        .otherwise(() => null);
    }
  }

  return results;
}

const erc20Interface = ERC20__factory.createInterface();
const erc721Interface = ERC721__factory.createInterface();
const erc1155Interface = ERC1155__factory.createInterface();

export type ParsedTokenTxData = [
  TokenStandard.ERC20 | TokenStandard.ERC721 | TokenStandard.ERC1155,
  TransactionDescription
];

export function parseStandardTokenTransactionData(
  data: string
): ParsedTokenTxData | null {
  try {
    return [TokenStandard.ERC20, erc20Interface.parseTransaction({ data })];
  } catch {
    // ignore and next try to parse with erc721 ABI
  }

  try {
    return [TokenStandard.ERC721, erc721Interface.parseTransaction({ data })];
  } catch {
    // ignore and next try to parse with erc1155 ABI
  }

  try {
    return [TokenStandard.ERC1155, erc1155Interface.parseTransaction({ data })];
  } catch {
    // ignore and return null
  }

  return null;
}

export function parseStandardTokenEvent(log: {
  topics: string[];
  data: string;
}) {
  try {
    return [TokenStandard.ERC20, erc20Interface.parseLog(log)] as const;
  } catch {
    // ignore and next try to parse with erc721 ABI
  }

  // TODO: After NFT added

  // try {
  //   return [TokenStandard.ERC721, erc721Interface.parseLog(log)] as const;
  // } catch {
  //   // ignore and next try to parse with erc1155 ABI
  // }

  // try {
  //   return [TokenStandard.ERC1155, erc1155Interface.parseLog(log)] as const;
  // } catch {
  //   // ignore and return null
  // }

  return null;
}

export async function isSmartContractAddress(
  provider: Provider,
  address: string
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

function ethStringify(v: ethers.BigNumberish) {
  return typeof v === "string" && ethers.utils.isAddress(v)
    ? ethers.utils.getAddress(v)
    : v.toString();
}

function isZeroHex(val?: any) {
  val = val?.toHexString?.() ?? val?.toString?.();
  return (
    !val ||
    val === "0x" ||
    val === "0x00" ||
    val === ethers.constants.AddressZero
  );
}
