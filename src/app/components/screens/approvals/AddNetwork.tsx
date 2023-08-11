import { FC, useCallback, useState } from "react";
import classNames from "clsx";
import retry from "async-retry";
import { assert } from "lib/system/assert";

import { AddNetworkApproval } from "core/types";
import { approveItem } from "core/client";

import { useDialog } from "app/hooks/dialog";
import { withHumanDelay } from "app/utils";
import Avatar from "app/components/elements/Avatar";
import vigvamLogoUrl from "app/images/vigvam.png";

import ApprovalLayout from "./Layout";

type ApproveAddNetworkProps = {
  approval: AddNetworkApproval;
};

const ApproveAddNetwork: FC<ApproveAddNetworkProps> = ({ approval }) => {
  const { alert } = useDialog();

  const [approving, setApproving] = useState(false);

  const validateRpc = useCallback(async () => {
    const params = approval.networkParams;
    const rpcUrl = params.rpcUrls[0];
    const rpcResponse = await retry(
      async () => {
        const res = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method: "eth_chainId",
            params: [],
          }),
        });

        if (res.ok) return res.json();
        throw new Error(res.statusText);
      },
      { retries: 1 },
    );

    const { id, jsonrpc, result } = rpcResponse;
    assert(id === 1);
    assert(jsonrpc === "2.0");
    assert(result === params.chainId);
  }, [approval.networkParams]);

  const handleApprove = useCallback(
    async (approved: boolean) => {
      setApproving(true);

      try {
        await withHumanDelay(async () => {
          await validateRpc();

          // TODO: Add network to Database(repo)

          await approveItem(approval.id, {
            approved,
          });
        });
      } catch (err: any) {
        alert({
          title: "Error",
          content: err?.message ?? "Unknown error occurred",
        });
        setApproving(false);
      }
    },
    [approval, setApproving, validateRpc, alert],
  );

  if (approval.source.type !== "page") return null;

  return (
    <ApprovalLayout
      approveText="Connect"
      declineText="Deny"
      className="items-center"
      approving={approving}
      onApprove={handleApprove}
    >
      <DappLogos dappLogoUrl={approval.source.favIconUrl} />
      <h1 className="text-2xl font-bold mt-4 mb-1">Add new network</h1>
      <span className="text-base text-center mb-6">
        {new URL(approval.source.url).host}
      </span>
    </ApprovalLayout>
  );
};

export default ApproveAddNetwork;

const iconsClassNames = classNames(
  "w-[4.65rem] h-[4.75rem] min-w-[4.75rem]",
  "border border-brand-main/60",
);

const DappLogos: FC<{ dappLogoUrl?: string }> = ({ dappLogoUrl }) => (
  <div className="flex items-center">
    <Avatar
      className={classNames(iconsClassNames, "z-10")}
      src={vigvamLogoUrl}
    />
    <Avatar
      className={classNames(iconsClassNames, "-ml-7")}
      src={dappLogoUrl}
      imageClassName="min-h-[calc(100%+1px)] min-w-[calc(100%+1px)]"
    />
  </div>
);
