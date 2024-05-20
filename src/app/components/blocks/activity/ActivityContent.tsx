import { memo, useCallback, useEffect, useState } from "react";
import classNames from "clsx";
import browser from "webextension-polyfill";
import { useLazyAtomValue } from "lib/atom-utils";

import { isPopup } from "lib/ext/view";
import { rejectAllApprovals } from "core/client";

import { approvalStatusAtom } from "app/atoms";
import { ToastOverflowProvider, ToastProvider } from "app/hooks/toast";
import { ReactComponent as LinkIcon } from "app/icons/external-link.svg";

import Button from "../../elements/Button";

import ApprovalStatus from "../ApprovalStatus";
import ActivitiesList from "./ActivitiesList";

const ActivityContent = memo(() => {
  const isPopupMode = isPopup();
  const [delayFinished, setDelayFinished] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDelayFinished(true), isPopupMode ? 50 : 200);
    return () => clearTimeout(t);
  }, [isPopupMode]);

  return (
    <ToastProvider>
      <ToastOverflowProvider>
        <div
          className={classNames(
            isPopupMode
              ? "w-full"
              : classNames("w-[54rem] h-full mx-auto", "px-4 pt-16"),
            "flex flex-col",
            !delayFinished ? "hidden" : "animate-bootfadeinfast",
          )}
        >
          <Approve />
          <ActivitiesList />
        </div>
      </ToastOverflowProvider>
    </ToastProvider>
  );
});

export default ActivityContent;

const Approve = memo(() => {
  const isPopupMode = isPopup();
  const approvalStatus = useLazyAtomValue(approvalStatusAtom);

  const handleApprove = useCallback(() => {
    browser.runtime.sendMessage("__OPEN_APPROVE_WINDOW");
  }, []);

  return (
    <>
      {approvalStatus && approvalStatus.total > 0 && (
        <div
          className={classNames(
            "w-full h-14 mb-10",
            "border border-brand-inactivedark/25",
            "animate-pulse hover:animate-none",
            "rounded-2xl",
            "flex items-center",
            "py-2.5",
            isPopupMode ? "px-3" : "px-5",
          )}
        >
          <ApprovalStatus readOnly theme="large" />
          <div className="flex-1" />

          <button
            type="button"
            className={classNames(
              "mr-2",
              "px-2 py-1",
              "!text-sm text-brand-inactivelight hover:text-brand-light",
              "transition-colors",
              "font-semibold",
            )}
            onClick={() => rejectAllApprovals()}
          >
            Reject all
          </button>

          <Button
            className={classNames(
              "!py-2 !text-sm",
              isPopupMode && "!min-w-[7.5rem]",
            )}
            onClick={handleApprove}
          >
            Approve
            <LinkIcon className="ml-1 w-4 h-4 min-w-[1rem]" />
          </Button>
        </div>
      )}
    </>
  );
});
