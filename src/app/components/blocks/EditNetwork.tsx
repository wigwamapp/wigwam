import { memo, useCallback, useMemo } from "react";
import classNames from "clsx";
import { Field, Form } from "react-final-form";

import * as Repo from "core/repo";
import { Network } from "core/types";
import {
  composeValidators,
  isLink,
  maxLength,
  minLength,
  required,
} from "app/utils";

import { useDialog } from "app/hooks/dialog";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import NumberInput from "app/components/elements/NumberInput";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import IconedButton from "app/components/elements/IconedButton";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as DeleteIcon } from "app/icons/Delete.svg";
import { ReactComponent as EditIcon } from "app/icons/edit-medium.svg";

type EditNetworkProps = {
  isNew: boolean;
  network?: Network;
  onCancelHandler: () => void;
  onNewNetworkCreated?: () => void;
  className?: string;
};

const EditNetwork = memo<EditNetworkProps>(
  ({ isNew, network, onCancelHandler, onNewNetworkCreated }) => {
    const initialChainId = useMemo(() => network?.chainId, [network?.chainId]);
    const { alert } = useDialog();

    const handleSubmit = useCallback(
      async ({ nName, rpcUrl, chainId, currencySymbol, blockExplorer }) => {
        try {
          const isChangedChainId = initialChainId && chainId !== initialChainId;
          if (isChangedChainId) {
            await Repo.networks.delete(Number(initialChainId));
          }

          const repoMethod = isNew || isChangedChainId ? "add" : "put";
          await Repo.networks[repoMethod]({
            chainId: Number(chainId),
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
            position: 0,
          });

          if (isNew && onNewNetworkCreated) {
            onNewNetworkCreated();
          }
          onCancelHandler();
        } catch (err: any) {
          alert({ title: "Error!", content: err.message });
        }
      },
      [alert, initialChainId, isNew, onCancelHandler, onNewNetworkCreated]
    );

    const deleteNetwork = useCallback(async () => {
      await Repo.networks.delete(Number(initialChainId));
    }, [initialChainId]);

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
            <div className="w-[21.875rem] flex items-center justify-between">
              <div className="flex">
                <EditIcon className="mr-3" />
                <h3 className="text-brand-light text-2xl font-bold">
                  Edit network
                </h3>
              </div>
              {!isNative && (
                <IconedButton
                  Icon={DeleteIcon}
                  onClick={deleteNetwork}
                  theme="tertiary"
                  aria-label="Delete network"
                  className="!w-8 !h-8"
                  iconClassName="!w-5"
                />
              )}
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
            initialValues={{
              nName: network?.name,
              rpcUrl: network?.rpcUrls[0],
              chainId: network?.chainId,
              currencySymbol: network?.nativeCurrency?.symbol,
              blockExplorer: network?.explorerUrls?.[0],
            }}
            render={({ handleSubmit, submitting }) => (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-start"
              >
                <div className="w-[21.875rem]">
                  <Field
                    name="nName"
                    validate={composeValidators(
                      required,
                      minLength(3),
                      maxLength(16)
                    )}
                  >
                    {({ input, meta }) => (
                      <Input
                        label="Network Name"
                        placeholder="Type network name"
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        readOnly={isNative}
                        inputClassName="h-11"
                        {...input}
                      />
                    )}
                  </Field>
                  <Field
                    name="rpcUrl"
                    validate={composeValidators(required, isLink)}
                  >
                    {({ input, meta }) => (
                      <Input
                        label="RPC URL"
                        placeholder="Insert rpc url"
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        readOnly={isNative}
                        className="mt-4"
                        inputClassName="h-11"
                        {...input}
                      />
                    )}
                  </Field>
                  <Field
                    name="chainId"
                    validate={composeValidators(
                      required,
                      minLength(4),
                      maxLength(12)
                    )}
                  >
                    {({ input, meta }) => (
                      <NumberInput
                        label="Chain ID"
                        placeholder="Type chain id"
                        decimalScale={0}
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        readOnly={isNative}
                        className="mt-4"
                        inputClassName="h-11"
                        {...input}
                      />
                    )}
                  </Field>
                  <Field
                    name="currencySymbol"
                    format={(v) => (v ? v.toUpperCase() : null)}
                    validate={composeValidators(
                      required,
                      minLength(2),
                      maxLength(8)
                    )}
                  >
                    {({ input, meta }) => (
                      <Input
                        label="Currency symbol"
                        placeholder="Type currency symbol"
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        readOnly={isNative}
                        className="mt-4"
                        inputClassName="h-11"
                        {...input}
                      />
                    )}
                  </Field>
                  <Field name="blockExplorer" validate={isLink}>
                    {({ input, meta }) => (
                      <Input
                        label="Block explorer"
                        placeholder="Insert block explorer link"
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        readOnly={isNative}
                        optional
                        className="mt-4"
                        inputClassName="h-11"
                        {...input}
                      />
                    )}
                  </Field>
                  <div className="flex mt-6">
                    <NewButton
                      type="button"
                      theme="secondary"
                      onClick={onCancelHandler}
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
                          ? "Adding..."
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
