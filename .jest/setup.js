// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";

import { TextEncoder, TextDecoder } from "util";
import { webcrypto } from "crypto";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.crypto = webcrypto;

jest.mock("webextension-polyfill", () => global.browser);
jest.mock("mem", () => (fn) => fn);

// Mock profile prefix for storage usage
// It can work on its own, but web-extension-polyfill
// storage mock doesn't work in this scenario
jest.mock("lib/ext/profile", () => {
  const originalModule = jest.requireActual("lib/ext/profile");

  return {
    __esModule: true,
    ...originalModule,
    underProfile: async (key) => `test_${key}`,
    getProfileId: async () => "test",
  };
});
