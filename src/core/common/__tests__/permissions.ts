import { Permission, SelfActivityKind } from "core/types";

import { wrapPermission, getPageOrigin } from "../permissions";

describe("wrapPermission", () => {
  it("should wrap permission with correct parent capability", () => {
    const permission: Permission = {
      accountAddresses: ["0x123", "0x456"],
      timeAt: 1697821898588, // Date.now() - static
      id: "123",
      origin: "test",
      chainId: 1,
    };
    const wrappedPermission = wrapPermission(permission);
    expect(wrappedPermission).toMatchSnapshot();
  });
});

describe("getPageOrigin", () => {
  it("should return page origin from activity source", () => {
    const activitySource = {
      type: "page" as const,
      url: "https://example.com/foo/bar/?x=y",
    };
    const pageOrigin = getPageOrigin(activitySource);
    expect(pageOrigin).toBe("https://example.com");
  });

  it("should throw error if activity source type is not page", () => {
    const activitySource = {
      type: "self" as const,
      kind: SelfActivityKind.Unknown,
    };
    expect(() => getPageOrigin(activitySource)).toThrowError();
  });
});
