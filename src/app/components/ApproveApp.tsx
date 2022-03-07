import { FC, useCallback, useLayoutEffect, useMemo, useState } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";
import { approveItem } from "core/client";

import { walletStatusAtom, approvalsAtom } from "app/atoms";

import BaseProvider from "./BaseProvider";
import Unlock from "./pages/Unlock";
import LongTextField from "./elements/LongTextField";

const ApproveApp: FC = () => (
  <BaseProvider>
    <ApproveRouter />
  </BaseProvider>
);

export default ApproveApp;

const ApproveRouter: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);

  return match(walletStatus)
    .with(WalletStatus.Unlocked, () => <Approve />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => <Destroy />);
};

const Destroy: FC = () => {
  useLayoutEffect(() => {
    window.close();
  }, []);

  return null;
};

const Approve: FC = () => {
  const approvals = useAtomValue(approvalsAtom);

  const currentApproval = useMemo(
    () => approvals[approvals.length - 1],
    [approvals]
  );

  const [lastError, setLastError] = useState<any>(null);

  const handleApprove = useCallback(
    async (approve: boolean) => {
      try {
        await approveItem(currentApproval.id, approve);
      } catch (err) {
        console.error(err);
        setLastError(err);
      }
    },
    [currentApproval, setLastError]
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="mb-8 pt-4 px-4 text-white text-xl font-semibold">
        TYPE: {currentApproval.type}
      </div>

      {lastError && (
        <div className="mb-8 px-4">
          <h2 className="mb-2 text-white text-xl font-semibold">Error</h2>

          <LongTextField
            readOnly
            value={lastError?.message || "Unknown error."}
          />
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-stretch">
        {[
          {
            content: "Canel",
            onClick: () => handleApprove(false),
          },
          {
            content: "Approve",
            onClick: () => handleApprove(true),
          },
        ].map(({ content, onClick }, i) => (
          <button
            key={i}
            className={classNames("w-1/2 h-20 p-4")}
            onClick={onClick}
          >
            <div
              className={classNames(
                "w-full h-full",
                "rounded-lg bg-slate-600",
                "text-white text-2xl",
                "flex items-center"
              )}
            >
              {content}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
