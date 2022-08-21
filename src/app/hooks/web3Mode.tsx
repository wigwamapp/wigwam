import { useCallback } from "react";
import { useAtom } from "jotai";

import { web3MetaMaskCompatibleAtom } from "app/atoms";

import { useDialog } from "./dialog";

export function useToggleMetaMaskCompatibleMode() {
  const [metamaskMode, setMetamaskMode] = useAtom(web3MetaMaskCompatibleAtom);
  const { alert, confirm } = useDialog();

  return useCallback(async () => {
    if (metamaskMode) {
      const response = await confirm({
        title: "MetaMask compatible mode",
        content: (
          <p className="mb-4">
            Are you sure you want to disable MetaMask compatible mode?
            <br />
            Please note, that you won&apos;t be able to interact with dApps!
            Also, you will have to refresh active browser tabs where dApps are
            opened. Learn more about{" "}
            <a
              href="https://vigvamapp.medium.com/how-vigvam-wallet-may-be-connected-to-any-dapp-with-the-aid-of-metamask-b688f9757184"
              target="_blank"
              rel="nofollow noreferrer"
              className="underline"
            >
              how it works here
            </a>
            .
          </p>
        ),
        yesButtonText: "Disable",
      });

      if (response) {
        setMetamaskMode(false);
      }
    } else {
      setMetamaskMode(true);
      alert({
        title: "MetaMask compatible mode",
        content: (
          <>
            <p>MetaMask compatible mode enabled.</p>
            <p className="mb-4">
              You will have to refresh active browser tabs where dApps are
              opened.
            </p>
          </>
        ),
      });
    }
  }, [alert, confirm, metamaskMode, setMetamaskMode]);
}
