import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import { nanoid } from "nanoid";
import { assert } from "lib/system/assert";

import {
  SigningStandard,
  RpcContext,
  ActivitySource,
  ActivityType,
} from "core/types";
import { approvalAdded } from "core/back/state";

import { validatePermission, validateAccount } from "./validation";

const { isAddress, getAddress, isHexString, toUtf8Bytes, hexlify } = ethers;

export async function requestSigning(
  rpcCtx: RpcContext,
  source: ActivitySource,
  standard: SigningStandard,
  params: any[],
) {
  validatePermission(source);

  let accountAddress: string;
  let message: any;

  switch (standard) {
    case SigningStandard.EthSign:
      throw ethErrors.provider.unsupportedMethod();

    case SigningStandard.PersonalSign:
      accountAddress = params[1];
      message = params[0];

      if (!isAddress(accountAddress)) {
        accountAddress = params[0];
        message = params[1];
      }
      break;

    case SigningStandard.SignTypedDataV1:
      accountAddress = params[1];
      message = params[0];
      break;

    case SigningStandard.SignTypedDataV3:
    case SigningStandard.SignTypedDataV4:
      accountAddress = params[0];
      message = params[1];
      break;

    default:
      throw new Error("Unhandled Signing standard");
  }

  try {
    accountAddress = getAddress(accountAddress);

    switch (standard) {
      case SigningStandard.PersonalSign:
        message = isHexString(message)
          ? message
          : hexlify(toUtf8Bytes(message));
        break;

      case SigningStandard.SignTypedDataV1:
        assert(
          Array.isArray(message) &&
            message.every(
              (item: any) =>
                typeof item.type === "string" &&
                typeof item.name === "string" &&
                typeof item.value === "string",
            ),
        );
        break;

      case SigningStandard.SignTypedDataV3:
      case SigningStandard.SignTypedDataV4:
        assert(
          message &&
            typeof message === "string" &&
            typeof JSON.parse(message) === "object",
        );
        break;

      default:
        throw new Error("Unhandled Signing standard");
    }
  } catch {
    throw ethErrors.rpc.invalidParams();
  }

  validateAccount(source, accountAddress);

  approvalAdded({
    id: nanoid(),
    type: ActivityType.Signing,
    source,
    timeAt: Date.now(),
    accountAddress,
    standard,
    message,
    rpcCtx,
  });
}

export async function recoverPersonalSign(
  rpcCtx: RpcContext,
  source: ActivitySource,
  params: any[],
) {
  validatePermission(source);

  let data, signature, ecRecoverAddr;
  try {
    [data, signature] = params;
    assert(isHexString(data) && isHexString(signature));

    ecRecoverAddr = recoverPersonalSignature({ data, signature });
  } catch {
    throw ethErrors.rpc.invalidParams();
  }

  rpcCtx.reply({ result: getAddress(ecRecoverAddr) });
}
