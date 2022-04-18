import { FC, memo, useLayoutEffect } from "react";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai";

import { ActivityType, Approval, WalletStatus } from "core/types";

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

  const currentApproval = approvals[0];

  if (!currentApproval) return null;

  return (
    <CurrentApproval key={currentApproval.id} approval={currentApproval} />
  );
};

type CurrentApprovalProps = {
  approval: Approval;
};

const CurrentApproval = memo<CurrentApprovalProps>(({ approval }) =>
  match(approval)
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
