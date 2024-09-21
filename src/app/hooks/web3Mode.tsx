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
          title: "Connect as Metamask",
          content: (
            <p className="mb-4">
              Are you sure you want to disable MetaMask compatible mode?
              <br />
              Please note, that you won&apos;t be able to interact with legacy
              dApps! And you will have to refresh active browser tabs where
              dApps are opened for the changes to take effect.
            </p>
          ),
          yesButtonText: "Disable",
        });

        if (response) {
          setMetamaskMode(MetaMaskCompatibleMode.Off);
        }
      } else {
        setMetamaskMode(modeToSet);

        if (withDialog) {
          alert({
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
                    ? "Only Wigwam will be connected to dApps"
                    : "You will be able to choose any wallet while connecting"}
                  .
                  <br />
                  Refresh active browser tabs where dApps are opened for the
                  changes to take effect.
                </p>
              </>
            ),
          });
        }
      }
    },
    [alert, confirm, setMetamaskMode, withDialog],
  );
}
