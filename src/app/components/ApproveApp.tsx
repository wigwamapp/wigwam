import { FC, memo, useEffect, useLayoutEffect, useRef } from "react";
import { match } from "ts-pattern";
import { useAtomValue } from "jotai";
import browser from "webextension-polyfill";
import { openOrFocusMainTab } from "lib/ext/utils";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";

import { ActivityType, Approval, WalletStatus } from "core/types";

import { walletStatusAtom, approvalsAtom } from "app/atoms";
import { ChainIdProvider } from "app/hooks";

import BaseProvider from "./BaseProvider";
import Unlock from "./screens/Unlock";
import ApproveConnection from "./screens/approvals/Connection";
import ApproveTransaction from "./screens/approvals/Transaction";
import Dialog from "./blocks/Dialog";

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
  const windowFocused = useWindowFocus();
  const firstOpen = useRef(true);

  const currentApproval = approvals[0];

  useEffect(() => {
    if (!currentApproval) return;

    if (!firstOpen.current && windowFocused) {
      if (currentApproval.source.type === "page") {
        if (currentApproval.source.tabId) {
          browser.tabs
            .update(currentApproval.source.tabId, {
              highlighted: true,
            })
            .catch(console.error);
        }
      } else {
        openOrFocusMainTab();
      }
    }

    firstOpen.current = false;
  }, [currentApproval, windowFocused]);

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
