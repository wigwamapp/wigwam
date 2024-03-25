import { FC, useCallback, useState } from "react";
import classNames from "clsx";
import { getPublicURL } from "lib/ext/utils";

import { AddEthereumChainParameter, AddNetworkApproval } from "core/types";
import { approveItem } from "core/client";
import { setupNewNetwork } from "core/common";

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

  const handleApprove = useCallback(
    async (approved: boolean) => {
      setApproving(true);

      try {
        await withHumanDelay(async () => {
          if (approved) {
            await setupNewNetwork(approval.networkParams);
          }

          await approveItem(approval.id, { approved });
        });
      } catch (err: any) {
        alert({
          title: "Error",
          content: err?.message ?? "Unknown error occurred",
        });
      } finally {
        setApproving(false);
      }
    },
    [approval, setApproving, alert],
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
