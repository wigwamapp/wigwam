import { FC, useLayoutEffect, useMemo } from "react";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai";

import { ActivityType, WalletStatus } from "core/types";

import { walletStatusAtom, approvalsAtom } from "app/atoms";
import { ChainIdProvider } from "app/hooks";

import BaseProvider from "./BaseProvider";
import Unlock from "./screens/Unlock";
import ApproveConnection from "./screens/approvals/Connection";
import ApproveTransaction from "./screens/approvals/Transaction";

const ApproveApp: FC = () => (
  <BaseProvider>
    <ApproveRouter />
  </BaseProvider>
);

export default ApproveApp;

const ApproveRouter: FC = () => {
  const walletStatus = useAtomValue(walletStatusAtom);

  return match(walletStatus)
    .with(WalletStatus.Unlocked, () => <Approvals />)
    .with(WalletStatus.Locked, () => <Unlock />)
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

  const currentApproval = useMemo(
    () => approvals[approvals.length - 1],
    [approvals]
  );

  if (!currentApproval) return null;

  return (
    match(currentApproval)
      .with({ type: ActivityType.Transaction }, (txApproval) => (
        <ChainIdProvider chainId={txApproval.chainId}>
          <ApproveTransaction approval={txApproval} />
        </ChainIdProvider>
      ))
      // .with({ type: ActivityType.Signing }, (sigApproval) => <ApproveSigning approval={sigApproval} />)
      .with({ type: ActivityType.Connection }, (conApproval) => (
        <ApproveConnection approval={conApproval} />
      ))
      .otherwise(() => null)
  );
};
