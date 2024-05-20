import { PublicError, withError } from "../base";

describe("Common > Base", () => {
  it("withError - Sync Success", () => {
    const kek = jest.fn().mockReturnValue("Hello");

    const result = withError("Hello", kek);
    expect(result).toBe("Hello");
  });

  it("withError - Async Success", () => {
    const kek = jest.fn().mockReturnValue(Promise.resolve("Hello"));

    const result = withError("Hello", kek);
    expect(result).resolves.toBe("Hello");
  });

  it("withError - Sync Error", () => {
    const kek = jest.fn().mockImplementation(() => {
      throw new Error("test");
    });

    expect(() => withError("Test Error", kek)).toThrowError("Test Error");
  });

  it("withError - Async Error", () => {
    const kek = jest.fn().mockImplementation(async () => {
      throw new Error("test");
    });

    expect(withError("Test Error", kek)).rejects.toThrowError("Test Error");
  });

  it("withError - Sync Public Error", () => {
    const kek = jest.fn().mockImplementation(() => {
      throw new PublicError("Public Test Error");
    });

    expect(() => withError("Test Error", kek)).toThrowError(
      "Public Test Error",
    );
  });

  it("withError - Async Public Error", () => {
    const kek = jest.fn().mockImplementation(async () => {
      throw new PublicError("Public Test Error");
    });

    expect(withError("Test Error", kek)).rejects.toThrowError(
      "Public Test Error",
    );
  });
});
