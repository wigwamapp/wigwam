import { FC, StrictMode, useCallback, useRef } from "react";
import classNames from "clsx";
import { render } from "react-dom";
import { ethers } from "ethers";
import { ERC20__factory } from "abi-types";
import { getRandomName } from "lib/random-name";

import { getClientProvider } from "core/client";
import * as Repo from "core/repo";
import useForceUpdate from "use-force-update";

async function sendPolygonTokens() {
  const chainId = 80001;

  const fromAccount = "0x0fA75abBE87608A6c3EA36e879C58ddC3e93F870";
  const recipient = "0xc6B7d9a476674DF8E8C39ec33585AAc3e38C75e3";

  const linkTokenAddress = "0x326c977e6efc84e512bb9c30f76e30c160ed06fb";

  const provider = getClientProvider(chainId).getSigner(fromAccount);

  const contract = ERC20__factory.connect(linkTokenAddress, provider);

  const convertedAmount = ethers.utils.parseUnits("0.0001", 18);

  const txResult = await contract.transfer(recipient, convertedAmount);
  console.info({ txResult });
}

async function sendBscTokens() {
  const chainId = 97;

  const fromAccount = "0x0fA75abBE87608A6c3EA36e879C58ddC3e93F870";
  const recipient = "0xc6B7d9a476674DF8E8C39ec33585AAc3e38C75e3";

  const daiTokenAddress = "0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867";

  const provider = getClientProvider(chainId).getSigner(fromAccount);

  const contract = ERC20__factory.connect(daiTokenAddress, provider);

  const convertedAmount = ethers.utils.parseUnits("0.0001", 18);

  const txResult = await contract.transfer(recipient, convertedAmount);
  console.info({ txResult });
}

async function generateRandomContacts() {
  for (let i = 0; i < 99; i++) {
    const name = getRandomName();
    const address = `0x29D7d1dd5B6f9C864d9db560D72a247c178aE8${
      i > 10 ? i : `0${i}`
    }`;
    const addedAt = new Date().getTime();
    await Repo.contacts.add({ name, address, addedAt });
  }
}

const ControlPanel: FC = () => {
  const actions: Record<string, () => Promise<void>> = {
    sendPolygonTokens,
    sendBscTokens,
    generateRandomContacts,
  };

  return (
    <div
      className={classNames(
        "overflow-hidden",
        "fixed bottom-[50%] right-[1rem]",
        "p-2",
        "flex flex-col",
        "bg-white/20 backdrop-blur-[10px]",
        "border border-brand-main/[.05]",
        "shadow-addaccountmodal rounded-[.625rem]"
      )}
    >
      {Object.keys(actions).map((key) => (
        <ControlButton key={key} action={actions[key]}>
          {`${key}()`}
        </ControlButton>
      ))}
    </div>
  );
};

const ControlButton: FC<{
  action: () => Promise<void>;
}> = ({ action, children }) => {
  const forceUpdate = useForceUpdate();
  const processesRef = useRef(0);

  const handleClick = useCallback(async () => {
    processesRef.current++;
    forceUpdate();

    try {
      await action();
    } catch (err) {
      console.error(err);
    }

    processesRef.current--;
    forceUpdate();
  }, [action, forceUpdate]);

  const processing = processesRef.current > 0;

  return (
    <button
      className={classNames(
        "w-auto py-4 px-6 last:mb-0 mb-3",
        "rounded-md",
        "bg-black/40 hover:bg-black/20",
        "text-base",
        "transition ease-in-out duration-300",
        processing && "animate-bounce"
      )}
      onClick={handleClick}
    >
      <div className={classNames("font-semibold")}>{children}</div>
    </button>
  );
};

const el = document.createElement("div");
document.body.appendChild(el);

render(
  <StrictMode>
    <ControlPanel />
  </StrictMode>,
  el
);
