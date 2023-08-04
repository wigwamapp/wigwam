import { ethErrors } from "eth-rpc-errors";

import {
  ActivitySource,
  RpcMessageContext,
  JsonRpcMethod,
  SigningStandard,
  JsonRpcError,
} from "core/types";
import * as repo from "core/repo";
import { getPageOrigin } from "core/common/permissions";

import { isUnlocked } from "../state";

import { sendRpc } from "./network";
import { RpcCtx } from "./context";
import {
  fetchPermission,
  requestConnection,
  requestTransaction,
  requestSigning,
  recoverPersonalSign,
  requestSwitchChain,
} from "./wallet";

export async function handleRpc(
  msgCtx: RpcMessageContext,
  source: ActivitySource,
  chainId: number,
  method: string,
  params: any[]
) {
  const rpcCtx = new RpcCtx(msgCtx);

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

        return await fetchPermission(rpcCtx, source);
      }

      case JsonRpcMethod.wallet_requestPermissions:
      case JsonRpcMethod.eth_requestAccounts: {
        dropForSelf(source);

        const returnSelectedAccount =
          method === JsonRpcMethod.eth_requestAccounts;

        return await requestConnection(
          rpcCtx,
          source,
          params,
          returnSelectedAccount
        );
      }

      case JsonRpcMethod.eth_sendTransaction: {
        await expandPermission();

        return await requestTransaction(rpcCtx, source, chainId, params);
      }

      case JsonRpcMethod.personal_sign:
      case JsonRpcMethod.eth_signTypedData:
      case JsonRpcMethod.eth_signTypedData_v1:
      case JsonRpcMethod.eth_signTypedData_v2:
      case JsonRpcMethod.eth_signTypedData_v3:
      case JsonRpcMethod.eth_signTypedData_v4: {
        await expandPermission();

        const standard = getSigningStandard(method);
        return await requestSigning(rpcCtx, source, standard, params);
      }

      case JsonRpcMethod.personal_ecRecover: {
        await expandPermission();

        return await recoverPersonalSign(rpcCtx, source, params);
      }

      case JsonRpcMethod.wallet_switchEthereumChain:
      case JsonRpcMethod.wallet_addEthereumChain: {
        dropForSelf(source);
        await expandPermission();

        const type =
          method === JsonRpcMethod.wallet_addEthereumChain ? "add" : "switch";
        return await requestSwitchChain(rpcCtx, type, source, params);
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

        rpcCtx.reply(await sendRpc(chainId, method, params));
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

    rpcCtx.reply({ error });
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
