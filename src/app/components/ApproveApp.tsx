import { FC, memo, Suspense, useLayoutEffect } from "react";
import classNames from "clsx";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai";

import { ActivityType, Approval, WalletStatus } from "core/types";

import { walletStatusAtom, approvalsAtom } from "app/atoms";
import { ChainIdProvider, TippySingletonProvider } from "app/hooks";

import BaseProvider from "./BaseProvider";
import Unlock from "./screens/Unlock";
import ApproveConnection from "./screens/approvals/Connection";
import ApproveTransaction from "./screens/approvals/Transaction";
import ApproveSigning from "./screens/approvals/Signing";
import Dialog from "./blocks/Dialog";
import ApprovalStatus from "./blocks/ApprovalStatus";

const ApproveApp: FC = () => (
  <BaseProvider>
    <ApproveRouter />

    <Dialog small />
  </BaseProvider>
);

export default ApproveApp;

const ApproveRouter: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);

  return match(walletStatus)
    .with(WalletStatus.Unlocked, () => <Approvals />)
    .with(WalletStatus.Locked, () => <Unlock isApproval />)
    .otherwise(() => <Destroy />);
};

const Destroy: FC = () => {
  useLayoutEffect(() => {
    window.close();
  }, []);

  return null;
};

const Approvals: FC = () => {
  const approvals = useAtomValue(approvalsAtom);

  const currentApproval = approvals[0];
  const statusBarDisplayed = approvals.length > 1;

  if (!currentApproval) return null;

  return (
    <div
      className={classNames(
        "w-full h-screen",
        "flex flex-col items-center justify-center",
        statusBarDisplayed && "pt-10"
      )}
    >
      <Suspense fallback={null}>
        {statusBarDisplayed && (
          <>
            <TippySingletonProvider>
              <div
                className={classNames(
                  "-mt-10 h-10",
                  "w-full max-w-[440px]",
                  "px-4 flex items-center"
                )}
              >
                <ApprovalStatus theme="small" readOnly />
              </div>
            </TippySingletonProvider>

            <div
              className={classNames(
                "-mb-[1.5rem]",
                "w-[calc(100%-2rem)] max-w-[408px]",
                "h-[2rem]",
                "rounded-xl border border-brand-main/[.07] shadow-approvestack",
                "brandbg-popup"
              )}
            />
          </>
        )}

        <CurrentApproval key={currentApproval.id} approval={currentApproval} />
      </Suspense>
    </div>
  );
};

type CurrentApprovalProps = {
  approval: Approval;
};

const CurrentApproval = memo<CurrentApprovalProps>(({ approval }) =>
  match(approval)
    .with({ type: ActivityType.Connection }, (conApproval) => (
      <ApproveConnection approval={conApproval} />
    ))
    .with({ type: ActivityType.Transaction }, (txApproval) => (
      <ChainIdProvider chainId={txApproval.chainId}>
        <ApproveTransaction approval={txApproval} />
      </ChainIdProvider>
    ))
    .with({ type: ActivityType.Signing }, (sigApproval) => (
      <ApproveSigning approval={sigApproval} />
    ))
    .otherwise(() => null)
);
