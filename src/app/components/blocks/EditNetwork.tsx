import React, { memo, useEffect, useState } from "react";
import classNames from "clsx";

import * as Repo from "core/repo";
import { Network } from "core/types";

import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as EditIcon } from "app/icons/edit.svg";

type EditNetworkProps = {
  isNew: boolean;
  network?: Network;
  onCancelHandler: () => void;
  className?: string;
};

const EditNetwork = memo<EditNetworkProps>(
  ({ isNew, network, onCancelHandler }) => {
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
      <div className={classNames("flex flex-col", "pl-6")}>
        <div className="flex items-center">
          {isNew ? (
            <PlusCircleIcon className="w-8 h-auto" />
          ) : (
            <EditIcon className="w-8 h-auto" />
          )}
          <h3 className="text-brand-light text-2xl font-bold ml-3">
            {isNew ? "Add new network" : "Edit network"}
          </h3>
        </div>

        <ScrollAreaContainer
          className={classNames("flex flex-col mt-6 pr-8")}
          viewPortClassName="pb-20 rounded-t-[.625rem]"
          scrollBarClassName="py-0 pb-20"
        >
          <form onSubmit={handleSubmit}>
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
              <NewButton
                theme="secondary"
                onClick={handleClear}
                className="!py-2 w-full"
              >
                Cancel
              </NewButton>

              <NewButton
                type="submit"
                onClick={handleClear}
                className="!py-2 ml-4 w-full"
                disabled={isNative}
              >
                {isNew ? "Add" : "Save"}
              </NewButton>
            </div>
          </form>
        </ScrollAreaContainer>
      </div>
    );
  }
);

export default EditNetwork;

const randomInteger = (min: number, max: number): number => {
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
};
