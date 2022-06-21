import { ethErrors } from "eth-rpc-errors";

import {
  ActivitySource,
  RpcReply,
  JsonRpcMethod,
  SigningStandard,
  JsonRpcError,
} from "core/types";
import * as repo from "core/repo";
import { getPageOrigin } from "core/common/permissions";

import { isUnlocked } from "../state";

import { sendRpc } from "./network";
import {
  fetchPermission,
  requestConnection,
  requestTransaction,
  requestSigning,
  recoverPersonalSign,
  requestSwitchChain,
} from "./wallet";

export async function handleRpc(
  source: ActivitySource,
  chainId: number,
  method: string,
  params: any[],
  reply: RpcReply
) {
  const expandPermission = async () => {
    if (source.type === "page") {
      if (!isUnlocked()) return;

      const origin = getPageOrigin(source);
      const permission = await repo.permissions.get(origin);

      if (permission) {
        source = {
          ...source,
          permission,
        };

        chainId = permission.chainId;
      }
    }
  };

  try {
    switch (method) {
      case JsonRpcMethod.wallet_getPermissions: {
        dropForSelf(source);

        return await fetchPermission(source, reply);
      }

      case JsonRpcMethod.wallet_requestPermissions:
      case JsonRpcMethod.eth_requestAccounts: {
        dropForSelf(source);

        const returnSelectedAccount =
          method === JsonRpcMethod.eth_requestAccounts;

        return await requestConnection(
          source,
          params,
          returnSelectedAccount,
          reply
        );
      }

      case JsonRpcMethod.eth_sendTransaction: {
        await expandPermission();

        return await requestTransaction(source, chainId, params, reply);
      }

      case JsonRpcMethod.personal_sign:
      case JsonRpcMethod.eth_signTypedData:
      case JsonRpcMethod.eth_signTypedData_v1:
      case JsonRpcMethod.eth_signTypedData_v2:
      case JsonRpcMethod.eth_signTypedData_v3:
      case JsonRpcMethod.eth_signTypedData_v4: {
        await expandPermission();

        const standard = getSigningStandard(method);
        return await requestSigning(source, standard, params, reply);
      }

      case JsonRpcMethod.personal_ecRecover: {
        await expandPermission();

        return await recoverPersonalSign(source, params, reply);
      }

      case JsonRpcMethod.wallet_switchEthereumChain:
      case JsonRpcMethod.wallet_addEthereumChain: {
        dropForSelf(source);
        await expandPermission();

        const type =
          method === JsonRpcMethod.wallet_addEthereumChain ? "add" : "switch";
        return await requestSwitchChain(type, source, params, reply);
      }

      case JsonRpcMethod.eth_sign:
      case JsonRpcMethod.eth_signTransaction:
      case JsonRpcMethod.eth_ecRecover:
      case JsonRpcMethod.wallet_watchAsset:
      case JsonRpcMethod.wallet_registerOnboarding: {
        // TODO: Implement separate logic for this methods
        throw ethErrors.provider.unsupportedMethod();
      }

      default: {
        await expandPermission();

        reply(await sendRpc(chainId, method, params));
      }
    }
  } catch (err: any) {
    console.warn(err);

    let error: JsonRpcError;
    if ("code" in err) {
      const { message, code, data } = err;
      error = { message, code, data };
    } else {
      error = ethErrors.rpc.internal();
    }

    reply({ error });
  }
}

function getSigningStandard(method: string) {
  switch (method) {
    case JsonRpcMethod.eth_sign:
      return SigningStandard.EthSign;

    case JsonRpcMethod.personal_sign:
      return SigningStandard.PersonalSign;

    case JsonRpcMethod.eth_signTypedData:
    case JsonRpcMethod.eth_signTypedData_v1:
      return SigningStandard.SignTypedDataV1;

    case JsonRpcMethod.eth_signTypedData_v3:
      return SigningStandard.SignTypedDataV3;

    case JsonRpcMethod.eth_signTypedData_v4:
      return SigningStandard.SignTypedDataV4;

    default:
      throw ethErrors.provider.unsupportedMethod();
  }
}

function dropForSelf(source: ActivitySource) {
  if (source.type === "self") {
    throw ethErrors.provider.unsupportedMethod();
  }
}
