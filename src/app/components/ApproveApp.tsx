import { FC, useCallback, useLayoutEffect, useMemo } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";
import { walletStatusAtom } from "app/atoms";
import { approveItem } from "core/client";

import BaseProvider from "./BaseProvider";
import Unlock from "./pages/Unlock";
import { approvalsAtom } from "app/atoms/approve";

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

  const handleApprove = useCallback(
    async (approve: boolean) => {
      try {
        await approveItem(currentApproval.id, approve);
      } catch (err) {
        console.error(err);
        alert("Error! Check dev tools.");
      }
    },
    [currentApproval]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 text-white text-xl font-semibold">
        TYPE: {currentApproval.type}
      </div>

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
