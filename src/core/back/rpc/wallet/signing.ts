import { ethers } from "ethers";
import { ethErrors } from "eth-rpc-errors";
import { recoverPersonalSignature } from "lib/eth-sig-util";
import { assert } from "lib/system/assert";

import {
  SigningStandard,
  RpcReply,
  ActivitySource,
  ActivityType,
} from "core/types";

import { validatePermission, validateAccount } from "./validation";
import { approvalAdded } from "core/back/state";
import { nanoid } from "nanoid";

const { isAddress, getAddress, isHexString, toUtf8Bytes, hexlify } =
  ethers.utils;

export async function requestSigning(
  source: ActivitySource,
  standard: SigningStandard,
  params: any[],
  rpcReply: RpcReply
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
                typeof item.value === "string"
            )
        );
        break;

      case SigningStandard.SignTypedDataV3:
      case SigningStandard.SignTypedDataV4:
        assert(
          message &&
            typeof message === "string" &&
            typeof JSON.parse(message) === "object"
        );
        break;
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
    rpcReply,
  });
}

export async function recoverPersonalSign(
  source: ActivitySource,
  params: any[],
  rpcReply: RpcReply
) {
  validatePermission(source);

  let data, signature;
  try {
    [data, signature] = params;
    assert(isHexString(data) && isHexString(signature));
  } catch {
    throw ethErrors.rpc.invalidParams();
  }

  const ecRecoverAddr = recoverPersonalSignature({ data, signature });

  rpcReply({ result: ecRecoverAddr });
}
