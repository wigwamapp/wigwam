import { useCallback } from "react";

import { toggleTokenStatus } from "core/common/tokens";
import { ReactComponent as ControlIcon } from "app/icons/control.svg";

import { useDialog } from "./dialog";
import { AccountToken, TokenType } from "core/types";

export function useHideToken(token?: AccountToken, onClose?: () => void) {
  const { confirm } = useDialog();

  return useCallback(async () => {
    const response = await confirm({
      title: "Hide asset",
      content: (
        <>
          <p className="mb-4 mx-auto text-center">
            Are you sure you want to hide{" "}
            <b>
              {(token?.tokenType === TokenType.Asset
                ? token.symbol
                : token?.name) ?? "Unknown token"}
            </b>
            ?
          </p>
          <p className="mx-auto text-center">
            You can turn it back on the{" "}
            <span className="inline-flex items-center">
              &quot;
              <ControlIcon /> Manage Tokens&quot;
            </span>{" "}
            at any time.
          </p>
        </>
      ),
      yesButtonText: "Hide",
    });

    if (response && token) {
      await toggleTokenStatus(token);
    }

    onClose?.();
  }, [confirm, token, onClose]);
}
