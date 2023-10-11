import { FC, useCallback, useState } from "react";
import classNames from "clsx";
import retry from "async-retry";
import { assert } from "lib/system/assert";
import { getPublicURL } from "lib/ext/utils";

import { AddEthereumChainParameter, AddNetworkApproval } from "core/types";
import { approveItem } from "core/client";
import * as Repo from "core/repo";

import { useDialog } from "app/hooks/dialog";
import { withHumanDelay } from "app/utils";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import DappLogos from "app/components/elements/approvals/DappLogos";
import { ReactComponent as AlertIcon } from "app/icons/add-network-alert.svg";

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
          const params = approval.networkParams;
          const chainId = parseInt(params.chainId);

          const networkExists = await Repo.networks.get(chainId);
          if (networkExists) {
            setApproving(false);
            return;
          }

          await Repo.networks.add({
            chainId,
            name: params.chainName,
            type: "unknown",
            chainTag: params.chainName.toLowerCase(),
            nativeCurrency: params.nativeCurrency,
            rpcUrls: params.rpcUrls,
            explorerUrls: params.blockExplorerUrls,
          });

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
      approveText="Add network"
      declineText="Deny"
      className="items-center"
      approving={approving}
      onApprove={handleApprove}
    >
      <DappLogos
        firstLogoUrl={
          approval.networkParams.iconUrls?.[0] ??
          getPublicURL(`icons/network/unknown.png`)
        }
        dappLogoUrl={approval.source.favIconUrl}
      />
      <h1 className="text-2xl font-bold mt-4 mb-1">Add custom network</h1>
      <span className="text-base text-center mb-6">
        requested by <strong>{new URL(approval.source.url).host}</strong>
      </span>
      <NetworkInfo info={approval.networkParams} />
      <AddNetworkWarnings />
    </ApprovalLayout>
  );
};

export default ApproveAddNetwork;

const NetworkInfo: FC<{ info: AddEthereumChainParameter }> = ({ info }) => {
  const infoArray = [
    {
      label: "Name",
      value: info.chainName,
    },
    {
      label: "RPC URL",
      value: info.rpcUrls[0],
    },
    {
      label: "Chain ID",
      value: parseInt(info.chainId),
    },
    {
      label: "Currency symbol",
      value: info.nativeCurrency.symbol,
    },
    {
      label: "Block explorer",
      value: info.blockExplorerUrls?.[0],
    },
  ];

  return (
    <ScrollAreaContainer
      className="w-full h-full box-content -mr-5 pr-5 grow"
      viewPortClassName="viewportBlock"
    >
      {infoArray.map(({ label, value }, index) => (
        <div
          key={label}
          className={classNames(
            "px-3 py-2.5 text-sm w-full flex border-b border-brand-main/[.07]",
            index === 0 ? "pt-0" : "",
            index === infoArray.length - 1 ? "border-none" : "",
          )}
        >
          <span className="w-[45%] text-brand-gray">{label}</span>
          <span className="w-[55%] text-brand-light font-medium text-right break-words">
            {value ?? "N/A"}
          </span>
        </div>
      ))}
    </ScrollAreaContainer>
  );
};

const AddNetworkWarnings: FC = () => (
  <div className="flex items-center py-3 border-y border-brand-main/[.07] mt-auto text-brand-inactivedark text-sm px-3">
    <AlertIcon className="w-[1.375rem] min-w-[1.375rem] h-auto mr-4" />
    Be careful switching to unknown networks, verify details before switching
  </div>
);
