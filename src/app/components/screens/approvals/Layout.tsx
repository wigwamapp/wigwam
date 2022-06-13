import { FC, ReactNode } from "react";
import classNames from "clsx";

import { OverflowProvider } from "app/hooks";
import Button from "app/components/elements/Button";

type ApprovalLayoutProps = {
  className?: string;
  approveText?: ReactNode;
  declineText?: ReactNode;
  disabled?: boolean;
  approving?: boolean;
  onApprove?: (approved: boolean) => void;
};

const ApprovalLayout: FC<ApprovalLayoutProps> = ({
  className,
  children,
  approveText = "Approve",
  declineText = "Decline",
  disabled,
  approving,
  onApprove,
}) => (
  <OverflowProvider>
    {(ref) => (
      <div
        ref={ref}
        className={classNames(
          "h-full flex flex-col",
          "pt-8 pb-5 px-6",
          className
        )}
      >
        {children}

        <div className="flex-1" />

        <div className="grid grid-cols-2 gap-3 w-full mt-5">
          <Button
            theme="secondary"
            className="w-full"
            onClick={() => onApprove?.(false)}
          >
            {declineText}
          </Button>

          <Button
            className="w-full"
            disabled={disabled}
            loading={approving}
            onClick={() => onApprove?.(true)}
          >
            {approveText}
          </Button>
        </div>
      </div>
    )}
  </OverflowProvider>
);

export default ApprovalLayout;
