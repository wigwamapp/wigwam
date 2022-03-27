import React, { memo, useCallback, useState } from "react";
import classNames from "clsx";
import { Field, Form } from "react-final-form";

import * as Repo from "core/repo";
import { Network } from "core/types";
import { composeValidators, isNumber, required } from "app/utils";

import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as DeleteIcon } from "app/icons/Delete.svg";
import { ReactComponent as EditIcon } from "app/icons/edit-medium.svg";

const emptyState = {
  nName: "",
  rpcUrl: "",
  chainId: "",
  currencySymbol: "",
  blockExplorer: "",
};

type EditNetworkProps = {
  isNew: boolean;
  network?: Network;
  onCancelHandler: () => void;
  className?: string;
};

const EditNetwork = memo<EditNetworkProps>(
  ({ isNew, network, onCancelHandler }) => {
    const [state, setState] = useState(
      network
        ? {
            nName: network.name,
            rpcUrl: network.rpcUrls[0],
            chainId: network.chainId,
            currencySymbol: network.nativeCurrency?.symbol,
            blockExplorer: network.explorerUrls?.[0] ?? "",
          }
        : emptyState
    );

    const handleClear = useCallback(() => {
      setState(emptyState);
      onCancelHandler();
    }, [onCancelHandler]);

    const handleSubmit = useCallback(
      ({ nName, rpcUrl, chainId, currencySymbol, blockExplorer }) => {
        const processNetwork = async () => {
          try {
            const repoMethod = isNew ? "add" : "put";
            await Repo.networks[repoMethod]({
              chainId: isNaN(Number(chainId))
                ? randomInteger(20, 2000)
                : Number(chainId),
              type: "unknown",
              rpcUrls: [rpcUrl],
              chainTag: "",
              name: nName,
              nativeCurrency: {
                name: currencySymbol,
                symbol: currencySymbol,
                decimals: 18,
              },
              explorerUrls: [blockExplorer],
            });
          } catch (err) {
            alert(err);
          }
          handleClear();
        };

        processNetwork();
      },
      [isNew, handleClear]
    );

    const deleteNetwork = useCallback(async () => {
      (async () => {
        await Repo.networks.delete(Number(state.chainId));
      })();
    }, [state]);

    const isNative = network && network.type !== "unknown";

    return (
      <section className={classNames("flex flex-col grow", "pl-6")}>
        <header className="flex items-center">
          {isNew ? (
            <>
              <PlusCircleIcon width={24} height={24} className="mr-4" />
              <h3 className="text-brand-light text-2xl font-bold">
                Add new network
              </h3>
            </>
          ) : (
            <div className="w-3/4 flex items-center justify-between">
              <div className="flex">
                <EditIcon className="mr-3" />
                <h3 className="text-brand-light text-2xl font-bold">
                  Edit network
                </h3>
              </div>
              <DeleteIcon className="cursor-pointer" onClick={deleteNetwork} />
            </div>
          )}
        </header>

        <ScrollAreaContainer
          className={classNames("flex flex-col  mt-6")}
          viewPortClassName="pb-20 rounded-t-[.625rem]"
          scrollBarClassName="py-0 pb-20"
        >
          <Form
            onSubmit={handleSubmit}
            initialValues={{ ...state }}
            render={({ handleSubmit, submitting }) => (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-start"
              >
                <div className="w-[21.875rem]">
                  <Field name="nName" validate={required}>
                    {({ input, meta }) => (
                      <Input
                        inputClassName="h-11"
                        {...input}
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        label="Network Name"
                        readOnly={isNative}
                      />
                    )}
                  </Field>
                  <Field name="rpcUrl" validate={required}>
                    {({ input, meta }) => (
                      <Input
                        className="mt-4"
                        inputClassName="h-11"
                        {...input}
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        label={"RPC URL"}
                        readOnly={isNative}
                      />
                    )}
                  </Field>
                  <Field
                    name="chainId"
                    validate={composeValidators(required, isNumber)}
                  >
                    {({ input, meta }) => (
                      <Input
                        className="mt-4"
                        inputClassName="h-11"
                        {...input}
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        label={"Chain ID"}
                        readOnly={isNative}
                      />
                    )}
                  </Field>
                  <Field name="currencySymbol" validate={required}>
                    {({ input, meta }) => (
                      <Input
                        className="mt-4"
                        inputClassName="h-11"
                        {...input}
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        label={"Currency symbol"}
                        readOnly={isNative}
                      />
                    )}
                  </Field>
                  <Field name="blockExplorer">
                    {({ input, meta }) => (
                      <Input
                        className="mt-4"
                        inputClassName="h-11"
                        {...input}
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        label="Block explorer"
                        readOnly={isNative}
                        optional
                      />
                    )}
                  </Field>
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
                      className="!py-2 ml-4 w-full"
                      disabled={isNative || submitting}
                    >
                      {submitting
                        ? isNew
                          ? "Adding"
                          : "Saving..."
                        : isNew
                        ? "Add"
                        : "Save"}
                    </NewButton>
                  </div>
                </div>
              </form>
            )}
          />
        </ScrollAreaContainer>
      </section>
    );
  }
);

export default EditNetwork;

const randomInteger = (min: number, max: number): number => {
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
};
