import { CryptoEngine } from "kdbxweb";
import { nanoid } from "nanoid";
import { toProtectedString, toProtectedPassword } from "lib/crypto-utils";
import { storage } from "lib/ext/storage";

import { AccountSource, ActivityType, RpcContext } from "core/types";

import { processApprove } from "../approve";
import { Vault } from "../vault";
import { approvalAdded } from "../state";

// Mock argon2 with just sha256
beforeAll(() => CryptoEngine.setArgon2Impl((p) => CryptoEngine.sha256(p)));

// Clean storage after each test
afterEach(() => storage.clear());

const TEST_PASSWORD = "123qweasd";
const ROOT_PATH = "m/44'/60'/0'/0";

const TEST_WALLET = {
  name: "Test wallet",
  phrase:
    "kiwi opinion escape sea crop potato picture fiction onion social excess vital",
  path: `${ROOT_PATH}/0`,
  rootXpub:
    "xpub6ECj87ryBkA2LB3hAzt53KLed7qybT5SYM18C6V1edgeATHzAUrEbCn2S363vYUPRSKisEVYZf6JhRQpizKsURvfot4uuhYSRqtxT2NRqAQ",
  address: "0xa37a58ED255089D9204125A0f3313826537759D9",
  secondAddress: "0x5418382DaAf09Cfc4cFA5F65CEE2A0b6815B8e77",
  privateKey:
    "0x91c90e34a6699a9b12272a18745b34533ecbbe94f7383524436a99bccd324619",
  publicKey:
    "0x040a9e012d5937956ca22110626e09ac8a058ae49b167eee94aaf5475f8dfd23e724e4644be26afb30a356c0e7d109ff55be38cbd12a085fd36cb6ea94761e81e1",
  publicKeyCompressed:
    "0x030a9e012d5937956ca22110626e09ac8a058ae49b167eee94aaf5475f8dfd23e7",
};

const createTestVault = async () => {
  const passHash = await toProtectedPassword(TEST_PASSWORD);
  const vault = await Vault.setup(
    passHash,
    [
      {
        name: TEST_WALLET.name,
        source: AccountSource.SeedPhrase,
        derivationPath: TEST_WALLET.path,
      },
    ],
    { lang: "en", phrase: toProtectedString(TEST_WALLET.phrase) },
  );

  return { vault, passHash };
};

describe("Approve", () => {
  it("not found", async () => {
    const { vault } = await createTestVault();

    expect(
      processApprove("123", { approved: true }, vault),
    ).rejects.toThrowError("Not Found");
  });

  it("not found", async () => {
    const { vault } = await createTestVault();

    const id = nanoid();
    const rpcCtx: RpcContext = {
      reply: jest.fn(),
      serialize: jest.fn(),
    };

    approvalAdded({
      id,
      type: ActivityType.Connection,
      source: {
        type: "page",
        url: "https://example.com",
      },
      timeAt: Date.now(),
      returnSelectedAccount: true,
      rpcCtx,
    });

    await processApprove(
      id,
      { approved: true, accountAddresses: [TEST_WALLET.address] },
      vault,
    );

    expect(rpcCtx.reply).toBeCalledWith({ result: [TEST_WALLET.address] });
  });
});
