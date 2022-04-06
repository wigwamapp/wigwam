import { FC, useCallback, useMemo, useState } from "react";

import { TransactionApproval } from "core/types";

import { ChainIdProvider } from "app/hooks";
import WalletCard from "app/components/elements/WalletCard";

import ApprovalLayout from "./Layout";
import { useAtomValue } from "jotai";
import { allAccountsAtom } from "app/atoms";
import { approveItem } from "core/client";
import LongTextField from "app/components/elements/LongTextField";

type ApproveTransactionProps = {
  approval: TransactionApproval;
};

const ApproveTransaction: FC<ApproveTransactionProps> = ({ approval }) => {
  const allAccounts = useAtomValue(allAccountsAtom);
  const account = useMemo(
    () => allAccounts.find((acc) => acc.address === approval.accountAddress)!,
    [approval, allAccounts]
  );

  const [lastError, setLastError] = useState<any>(null);

  const handleApprove = useCallback(
    async (approved: boolean) => {
      try {
        await approveItem(approval.id, { approved });
      } catch (err) {
        console.error(err);
        setLastError(err);
      }
    },
    [approval, setLastError]
  );

  return (
    <ApprovalLayout onApprove={handleApprove}>
      <ChainIdProvider chainId={approval.chainId}>
        <WalletCard account={account} />

        {lastError && (
          <div className="mb-8 px-4">
            <h2 className="mb-2 text-white text-xl font-semibold">Error</h2>

            <LongTextField
              readOnly
              value={lastError?.message || "Unknown error."}
            />
          </div>
        )}
      </ChainIdProvider>
    </ApprovalLayout>
  );
};

export default ApproveTransaction;
