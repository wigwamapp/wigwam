import { FC, PropsWithChildren, ReactNode } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { approvalStatusAtom } from "app/atoms";
import { OverflowProvider } from "app/hooks";
import Button from "app/components/elements/Button";

type ApprovalLayoutProps = PropsWithChildren<{
  className?: string;
  approveText?: ReactNode;
  declineText?: ReactNode;
  disabled?: boolean;
  approving?: boolean;
  onApprove?: (approved: boolean) => void;
}>;

const ApprovalLayout: FC<ApprovalLayoutProps> = ({
  className,
  children,
  approveText = "Approve",
  declineText = "Decline",
  disabled,
  approving,
  onApprove,
}) => {
  const { total } = useAtomValue(approvalStatusAtom);

  return (
    <OverflowProvider>
      {(ref) => (
        <div
          ref={ref}
          className={classNames(
            "w-[calc(100%-2px)] max-w-[438px]",
            total > 1
              ? "h-[calc(100%+2px)] max-h-[662px]"
              : "h-[calc(100%+2px+0.75rem)] max-h-[calc(662px+0.75rem)] -mt-3",
            "min-h-[400px]",
            "rounded-xl border border-brand-main/[.07] shadow-approvestack",
            "brandbg-popup",
            "flex flex-col",
            "pt-8 pb-5 px-6",
            className,
          )}
        >
          {children}

          <div className="flex-1 shrink-0" />

          <div className="grid grid-cols-2 gap-3 w-full mt-5">
            <Button
              theme="secondary"
              className="w-full"
              onClick={() => {
                // const urlSearchParams = new URLSearchParams(window.location.hash.slice(1));
                // const lastActiveTab = urlSearchParams.get('lastActiveTab');
                // if (lastActiveTab) {
                //   chrome.tabs.update(Number(lastActiveTab), { active: true })
                // }
                onApprove?.(false);
              }}
            >
              {declineText}
            </Button>

            <Button
              className="w-full"
              disabled={disabled}
              loading={approving}
              onClick={() => {
                // const urlSearchParams = new URLSearchParams(window.location.hash.slice(1));
                // const lastActiveTab = urlSearchParams.get('lastActiveTab');
                // if (lastActiveTab) {
                //   chrome.tabs.update(Number(lastActiveTab), { active: true })
                // }
                onApprove?.(true);
              }}
            >
              {approveText}
            </Button>
          </div>
        </div>
      )}
    </OverflowProvider>
  );
};

export default ApprovalLayout;
