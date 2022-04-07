import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

import { TransactionApproval } from "core/types";

import { useProvider } from "app/hooks";
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

  const provider = useProvider().getSigner(account.address);

  useEffect(() => {
    (async () => {
      try {
        let { txParams } = approval;

        if ("gas" in txParams) {
          const { gas, ...rest } = txParams;
          txParams = { ...rest, gasLimit: gas };
        }

        const tx = await provider.populateTransaction({
          ...txParams,
          type: hexToNum(txParams?.type),
          chainId: hexToNum(txParams?.chainId),
        });

        const preparedTx = {
          ...tx,
          from: undefined,
          nonce: hexToNum(tx.nonce),
        };

        console.info({ preparedTx });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [provider, approval]);

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
    </ApprovalLayout>
  );
};

export default ApproveTransaction;

function hexToNum(v?: ethers.BigNumberish) {
  return v !== undefined ? ethers.BigNumber.from(v).toNumber() : undefined;
}
