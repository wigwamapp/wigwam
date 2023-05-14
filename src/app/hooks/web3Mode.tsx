import { useCallback } from "react";
import { useSetAtom } from "jotai";

import { MetaMaskCompatibleMode } from "core/types";

import { web3MetaMaskCompatibleAtom } from "app/atoms";
import { ReactComponent as SuccessIcon } from "app/icons/check-big.svg";

import { useDialog } from "./dialog";

export function useSetMetaMaskCompatibleMode(withDialog = true) {
  const setMetamaskMode = useSetAtom(web3MetaMaskCompatibleAtom);
  const { alert, confirm } = useDialog();

  return useCallback(
    async (modeToSet: MetaMaskCompatibleMode) => {
      if (modeToSet === MetaMaskCompatibleMode.Off) {
        const response = await confirm({
          title: "MetaMask compatible mode",
          content: (
            <p className="mb-4">
              Are you sure you want to disable MetaMask compatible mode?
              <br />
              Please note, that you won&apos;t be able to interact with dApps!
              And you will have to refresh active browser tabs where dApps are
              opened for the changes to take effect.
              <br />
              Learn more about{" "}
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
          setMetamaskMode(MetaMaskCompatibleMode.Off);
        }
      } else {
        setMetamaskMode(modeToSet);
        withDialog
          ? alert({
              title: (
                <div className="flex flex-col items-center">
                  <SuccessIcon className="mb-4" />
                  MetaMask compatible mode
                </div>
              ),
              content: (
                <>
                  <p>
                    MetaMask compatible mode switched to{" "}
                    <strong>
                      {modeToSet === MetaMaskCompatibleMode.Strict
                        ? "By Default"
                        : "Hybrid"}
                    </strong>
                    .{" "}
                    {modeToSet === MetaMaskCompatibleMode.Strict
                      ? "Only Vigvam will be connected to dApps"
                      : "You will be able to choose any wallet while connecting"}
                    .
                    <br />
                    Refresh active browser tabs where dApps are opened for the
                    changes to take effect.
                  </p>
                </>
              ),
            })
          : null;
      }
    },
    [alert, confirm, setMetamaskMode, withDialog]
  );
}
