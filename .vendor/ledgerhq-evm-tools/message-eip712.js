var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };
import { ethers } from "../../../../../ethers";
import SHA224 from "crypto-js/sha224";
import { getEnv } from "@ledgerhq/live-env";
import network from "@ledgerhq/live-network/network";
import EIP712CAL from "@ledgerhq/cryptoassets/data/eip712";
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
// As defined in [spec](https://eips.ethereum.org/EIPS/eip-712), the properties below are all required.
export function isEIP712Message(message) {
  return (
    !!message &&
    typeof message === "object" &&
    "types" in message &&
    "primaryType" in message &&
    "domain" in message &&
    "message" in message
  );
}
export const sortObjectAlphabetically = (obj) => {
  const keys = Object.keys(obj).sort();
  return keys.reduce((acc, curr) => {
    const value = (() => {
      if (Array.isArray(obj[curr])) {
        return obj[curr].map((field) => sortObjectAlphabetically(field));
      }
      return obj[curr];
    })();
    acc[curr] = value;
    return acc;
  }, {});
};
export const getSchemaHashForMessage = (message) => {
  const { types } = message;
  const sortedTypes = sortObjectAlphabetically(types);
  return SHA224(JSON.stringify(sortedTypes).replace(" ", "")).toString();
};
/**
 * Tries to find the proper filters for a given EIP712 message
 * in the CAL
 *
 * @param {EIP712Message} message
 * @returns {MessageFilters | undefined}
 */
export const getFiltersForMessage = (message, remoteCryptoAssetsListURI) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const schemaHash = getSchemaHashForMessage(message);
    const messageId = `${
      (_b =
        (_a = message.domain) === null || _a === void 0
          ? void 0
          : _a.chainId) !== null && _b !== void 0
        ? _b
        : 0
    }:${
      (_d =
        (_c = message.domain) === null || _c === void 0
          ? void 0
          : _c.verifyingContract) !== null && _d !== void 0
        ? _d
        : NULL_ADDRESS
    }:${schemaHash}`;
    try {
      if (remoteCryptoAssetsListURI) {
        const { data: dynamicCAL } = yield network({
          method: "GET",
          url: `${remoteCryptoAssetsListURI}/eip712.json`,
        });
        return dynamicCAL[messageId] || EIP712CAL[messageId];
      }
      throw new Error();
    } catch (e) {
      return EIP712CAL[messageId];
    }
  });
/**
 * Get the value at a specific path of an object and return it as a string or as an array of string
 * Used recursively by getValueFromPath
 *
 * @see getValueFromPath
 */
const getValue = (path, value) => {
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map((v) => getValue(path, v)).flat();
    }
    /* istanbul ignore if : unecessary test of a throw */
    if (!(path in value)) {
      throw new Error(`Could not find key ${value} in ${path}`);
    }
    const result = value[path];
    return typeof result === "object" ? result : result.toString();
  }
  return value.toString();
};
/**
 * Using a path as a string, returns the value(s) of a json key without worrying about depth or arrays
 * (e.g: 'to.wallets.[]' => ["0x123", "0x456"])
 */
const getValueFromPath = (path, eip721Message) => {
  const splittedPath = path.split(".");
  const { message } = eip721Message;
  let value = message;
  for (let i = 0; i <= splittedPath.length - 1; i++) {
    const subPath = splittedPath[i];
    const isLastElement = i >= splittedPath.length - 1;
    if (subPath === "[]" && !isLastElement) continue;
    value = getValue(subPath, value);
  }
  /* istanbul ignore if : unecessary test of a throw */
  if (value === message) {
    throw new Error("getValueFromPath returned the whole original message");
  }
  return value;
};
/**
 * Gets the fields visible on the nano for a specific EIP712 message
 */
export const getEIP712FieldsDisplayedOnNano = (
  messageData,
  remoteCryptoAssetsListURI = getEnv("DYNAMIC_CAL_BASE_URL"),
) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!isEIP712Message(messageData)) {
      return null;
    }
    const _e = messageData.types,
      { EIP712Domain } = _e,
      otherTypes = __rest(_e, ["EIP712Domain"]);
    const displayedInfos = [];
    const filters = yield getFiltersForMessage(
      messageData,
      remoteCryptoAssetsListURI,
    );
    if (!filters) {
      const { types } = messageData;
      const domainFields = types["EIP712Domain"].map(({ name }) => name);
      if (domainFields.includes("name") && messageData.domain.name) {
        displayedInfos.push({
          label: "name",
          value: messageData.domain.name,
        });
      }
      if (domainFields.includes("version") && messageData.domain.version) {
        displayedInfos.push({
          label: "version",
          value: messageData.domain.version,
        });
      }
      if (domainFields.includes("chainId") && messageData.domain.chainId) {
        displayedInfos.push({
          label: "chainId",
          value: messageData.domain.chainId.toString(),
        });
      }
      if (
        domainFields.includes("verifyingContract") &&
        messageData.domain.verifyingContract
      ) {
        displayedInfos.push({
          label: "verifyingContract",
          value: messageData.domain.verifyingContract.toString(),
        });
      }
      if (domainFields.includes("salt") && messageData.domain.salt) {
        displayedInfos.push({
          label: "salt",
          value: messageData.domain.salt.toString(),
        });
      }
      displayedInfos.push({
        label: "Message hash",
        value: ethers.TypedDataEncoder.hashStruct(
          messageData.primaryType,
          otherTypes,
          messageData.message,
        ),
      });
      return displayedInfos;
    }
    const { contractName, fields } = filters;
    if (contractName && contractName.label) {
      displayedInfos.push({
        label: "Contract",
        value: contractName.label,
      });
    }
    for (const field of fields) {
      displayedInfos.push({
        label: field.label,
        value: getValueFromPath(field.path, messageData),
      });
    }
    return displayedInfos;
  });
//# sourceMappingURL=../../node_modules/@ledgerhq/evm-tools/lib-es/message/EIP712/index.js.map
