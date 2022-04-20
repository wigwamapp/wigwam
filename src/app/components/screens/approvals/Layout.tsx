import { FC, ReactNode } from "react";
import classNames from "clsx";

import NewButton from "app/components/elements/NewButton";

type ApprovalLayoutProps = {
  className?: string;
  approveText?: ReactNode;
  declineText?: ReactNode;
  loading?: boolean;
  onApprove?: (approved: boolean) => void;
};

const ApprovalLayout: FC<ApprovalLayoutProps> = ({
  className,
  children,
  approveText = "Approve",
  declineText = "Decline",
  loading,
  onApprove,
}) => (
  <div
    className={classNames(
      "h-screen flex flex-col",
      "pt-8 pb-5 px-6",
      className
    )}
  >
    {children}

    <div className="flex-1" />

    <div className="grid grid-cols-2 gap-3 w-full mt-5">
      <NewButton
        type="button"
        theme="secondary"
        className="w-full"
        onClick={() => onApprove?.(false)}
      >
        {declineText}
      </NewButton>

      <NewButton
        type="button"
        className="w-full"
        loading={loading}
        onClick={() => onApprove?.(true)}
      >
        {approveText}
      </NewButton>
    </div>
  </div>
);

export default ApprovalLayout;
