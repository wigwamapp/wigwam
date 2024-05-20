import { FC, PropsWithChildren, StrictMode, useCallback, useRef } from "react";
import classNames from "clsx";
import { createRoot } from "react-dom/client";
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

  const provider = getClientProvider(chainId).getUncheckedSigner(fromAccount);

  const contract = ERC20__factory.connect(linkTokenAddress, provider);

  const convertedAmount = ethers.parseUnits("0.0001", 18);

  const txResult = await contract.transfer(recipient, convertedAmount);
  console.info({ txResult });
}

async function sendBscTokens() {
  const chainId = 97;

  const fromAccount = "0x0fA75abBE87608A6c3EA36e879C58ddC3e93F870";
  const recipient = "0xc6B7d9a476674DF8E8C39ec33585AAc3e38C75e3";

  const daiTokenAddress = "0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867";

  const provider = getClientProvider(chainId).getUncheckedSigner(fromAccount);

  const contract = ERC20__factory.connect(daiTokenAddress, provider);

  const convertedAmount = ethers.parseUnits("0.0001", 18);

  const txResult = await contract.transfer(recipient, convertedAmount);
  console.info({ txResult });
}

async function approveBscTokens() {
  const chainId = 97;

  const fromAccount = "0xc6B7d9a476674DF8E8C39ec33585AAc3e38C75e3";
  const recipient = "0x0fA75abBE87608A6c3EA36e879C58ddC3e93F870";

  const daiTokenAddress = "0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867";

  const provider = getClientProvider(chainId).getUncheckedSigner(fromAccount);

  const contract = ERC20__factory.connect(daiTokenAddress, provider);

  const convertedAmount = ethers.parseUnits("0", 18);

  const txResult = await contract.approve(recipient, convertedAmount);
  console.info({ txResult });
}

async function generateRandomContacts() {
  const contractsToAdd: any[] = [];

  const seedPhrase = ethers.Wallet.createRandom().mnemonic;
  const hdNode = ethers.HDNodeWallet.fromMnemonic(seedPhrase!);

  for (let i = 0; i < 99; i++) {
    const { address } = hdNode.derivePath(`m/44'/60'/0'/0/${i}`);
    const name = getRandomName();
    const addedAt = new Date().getTime();

    contractsToAdd.push({ address, name, addedAt });
  }

  await Repo.contacts.bulkPut(contractsToAdd);
}

const ControlPanel: FC = () => {
  const actions: Record<string, () => Promise<void>> = {
    sendPolygonTokens,
    sendBscTokens,
    approveBscTokens,
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
        "shadow-addaccountmodal rounded-[.625rem]",
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

const ControlButton: FC<
  PropsWithChildren<{
    action: () => Promise<void>;
  }>
> = ({ action, children }) => {
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
        "w-auto py-1 px-2 last:mb-0 mb-1",
        "rounded-md",
        "bg-black/40 hover:bg-black/20",
        "text-xs text-left",
        "transition ease-in-out duration-300",
        processing && "animate-bounce",
      )}
      onClick={handleClick}
    >
      <div className={classNames("font-semibold")}>{children}</div>
    </button>
  );
};

const el = document.createElement("div");
document.body.appendChild(el);

createRoot(el).render(
  <StrictMode>
    <ControlPanel />
  </StrictMode>,
);
