import { ethers } from "ethers";
import { BSC_CHAIN_ID, BSC_RPC_URLS } from "./defaults";
import { Erc20__factory } from "abi-types";

const provider = new ethers.providers.JsonRpcProvider(
  BSC_RPC_URLS[0],
  BSC_CHAIN_ID
);

const bep20 = Erc20__factory.connect(
  "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
  provider
);

(async () => {
  try {
    console.info(
      await Promise.all([bep20.name(), bep20.decimals(), bep20.symbol()])
    );

    const filterFrom = bep20.filters.Transfer(
      "0x631fc1ea2270e98fbd9d92658ece0f5a269aa161",
      null,
      null
    );
    console.info(
      await bep20.queryFilter(filterFrom, 4449655 - 100, 4449655 + 100)
    );
  } catch (err) {
    console.error(err);
  }
})();
