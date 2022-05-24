import { ethErrors } from "eth-rpc-errors";
import {
  ActivitySource,
  RpcReply,
  JsonRpcMethod,
  SigningStandard,
  JsonRpcError,
} from "core/types";

import { sendRpc } from "./network";
import {
  requestConnection,
  requestTransaction,
  requestSigning,
  fetchPermission,
} from "./wallet";

export async function handleRpc(
  source: ActivitySource,
  chainId: number,
  method: string,
  params: any[],
  reply: RpcReply
) {
  try {
    switch (method) {
      case JsonRpcMethod.wallet_getPermissions: {
        if (source.type === "self") {
          throw ethErrors.provider.unsupportedMethod();
        }

        return await fetchPermission(source, reply);
      }

      case JsonRpcMethod.wallet_requestPermissions:
      case JsonRpcMethod.eth_requestAccounts: {
        if (source.type === "self") {
          throw ethErrors.provider.unsupportedMethod();
        }

        const returnSelectedAccount =
          method === JsonRpcMethod.eth_requestAccounts;

        return await requestConnection(
          source,
          params,
          returnSelectedAccount,
          reply
        );
      }

      case JsonRpcMethod.eth_sendTransaction:
        return await requestTransaction(source, chainId, params, reply);

      case JsonRpcMethod.eth_sign:
      case JsonRpcMethod.personal_sign:
      case JsonRpcMethod.eth_signTypedData:
      case JsonRpcMethod.eth_signTypedData_v1:
      case JsonRpcMethod.eth_signTypedData_v2:
      case JsonRpcMethod.eth_signTypedData_v3:
      case JsonRpcMethod.eth_signTypedData_v4: {
        const standard = getSigningStandard(method);
        return await requestSigning(source, standard, params, reply);
      }

      case JsonRpcMethod.eth_signTransaction:
      case JsonRpcMethod.eth_ecRecover:
      case JsonRpcMethod.personal_ecRecover:
      case JsonRpcMethod.wallet_addEthereumChain:
      case JsonRpcMethod.wallet_switchEthereumChain:
      case JsonRpcMethod.wallet_watchAsset:
        // TODO: Implement separate logic for this methods
        throw ethErrors.provider.unsupportedMethod();

      default:
        reply(await sendRpc(chainId, method, params));
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
