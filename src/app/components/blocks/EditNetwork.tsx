import React, { memo, useEffect, useState } from "react";
import * as Repo from "core/repo";
import classNames from "clsx";

import Input from "app/components/elements/Input";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as EditIcon } from "app/icons/edit.svg";
import { ReactComponent as DeleteIcon } from "app/icons/Delete.svg";
import { Network } from "core/types";

interface EditNetworkProps {
  isNew: boolean;
  network?: Network;
  onCancelHandler: () => void;
  className?: string;
}

const EditNetwork = memo<EditNetworkProps>(
  ({ isNew, network, onCancelHandler, className = "" }) => {
    const [state, setState] = useState({
      nName: network?.name ?? "",
      rpcUrl: network?.rpcUrls[0] ?? "",
      chainId: network?.chainId ?? "",
      currencySymbol: network?.nativeCurrency?.symbol ?? "",
      blockExplorer: network?.explorerUrls?.[0] ?? "",
    });

    // Clear the state on "Add new network" open
    useEffect(() => {
      setState({
        nName: network?.name ?? "",
        rpcUrl: network?.rpcUrls[0] ?? "",
        chainId: network?.chainId ?? "",
        currencySymbol: network?.nativeCurrency?.symbol ?? "",
        blockExplorer: network?.explorerUrls?.[0] ?? "",
      });
    }, [isNew, network]);

    const handleSubmit = async () => {
      try {
        const repoMethod = isNew ? "add" : "put";
        await Repo.networks[repoMethod]({
          chainId: isNaN(Number(state.chainId))
            ? randomInteger(20, 2000)
            : Number(state.chainId),
          type: "unknown",
          rpcUrls: [state.rpcUrl],
          chainTag: "",
          name: state.nName,
          nativeCurrency: {
            name: state.currencySymbol,
            symbol: state.currencySymbol,
            decimals: 18,
          },
          explorerUrls: [state.blockExplorer],
        });
      } catch (err) {
        alert(err);
      }
      handleClear();
    };

    const handleClear = () => {
      setState({
        nName: "",
        rpcUrl: "",
        chainId: "",
        currencySymbol: "",
        blockExplorer: "",
      });
      onCancelHandler();
    };

    const onChangeInput =
      (field: keyof typeof state) => (e: React.FormEvent<HTMLInputElement>) =>
        setState({ ...state, [field]: e.currentTarget.value });

    const isNative = network && network.type !== "unknown";

    return (
      <section className={className}>
        <header className="flex items-center justify-between">
          <div className="flex items-center">
            {isNew ? (
              <PlusCircleIcon width={24} height={24} className="mr-4" />
            ) : (
              <EditIcon className="mr-3" />
            )}
            <h3 className="text-brand-light text-2xl font-bold">
              {isNew ? "Add new network" : "Edit network"}
            </h3>
          </div>
          <DeleteIcon />
        </header>
        <form className="mt-7" onSubmit={handleSubmit}>
          <Input
            value={state.nName}
            onChange={onChangeInput("nName")}
            label="Network Name"
            readOnly={isNative}
          />
          <Input
            className="mt-4"
            value={state.rpcUrl}
            onChange={onChangeInput("rpcUrl")}
            label={"RPC URL"}
            readOnly={isNative}
          />
          <Input
            className="mt-4"
            value={state.chainId}
            onChange={onChangeInput("chainId")}
            label="Chain ID"
            readOnly={isNative}
          />
          <Input
            className="mt-4"
            value={state.currencySymbol}
            onChange={onChangeInput("currencySymbol")}
            label="Currency symbol"
            optional
            readOnly={isNative}
          />
          <Input
            className="mt-4"
            value={state.blockExplorer}
            onChange={onChangeInput("blockExplorer")}
            label="Block explorer"
            optional
            readOnly={isNative}
          />
          <div className="flex mt-6">
            <button
              className={classNames(
                "grow w-full",
                "py-2",
                "text-brand-light text-base font-bold",
                "bg-brand-main bg-opacity-10",
                "hover:bg-brand-darklight hover:bg-opacity-100 hover:shadow-buttonsecondary",
                "focus-visible:bg-brand-darklight focus-visible:bg-opacity-100 focus-visible:shadow-buttonsecondary",
                "active:bg-brand-main active:text-brand-light/60 active:bg-opacity-10 active:shadow-none",
                "rounded-[.375rem]",
                "transition"
              )}
              onClick={handleClear}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={classNames(
                "grow w-full ml-4",
                "py-2",
                "text-brand-light text-base font-bold",
                "bg-buttonaccent bg-opacity-90",
                "hover:bg-opacity-100 hover:shadow-buttonaccent",
                "focus-visible:bg-opacity-100 focus-visible:shadow-buttonaccent",
                "active:bg-opacity-70 active:shadow-none",
                "disabled:bg-opacity-10 disabled:shadow-none disabled:text-brand-light/30",
                "rounded-[.375rem]",
                "transition"
              )}
              disabled={isNative}
            >
              {isNew ? "Add" : "Save"}
            </button>
          </div>
        </form>
      </section>
    );
  }
);

function randomInteger(min: number, max: number): number {
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

export default EditNetwork;
