import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import classNames from "clsx";
import { Field, FieldMetaState, Form } from "react-final-form";
import { FormApi } from "final-form";
import { useThrottledCallback } from "use-debounce";
import * as Popover from "@radix-ui/react-popover";
import { usePasteFromClipboard } from "lib/react-hooks/usePasteFromClipboard";
import { storage } from "lib/ext/storage";

import * as Repo from "core/repo";
import {
  cleanupNetwork,
  getRpcUrlKey,
  mergeNetworkUrls,
  setRpcUrl,
} from "core/common";
import { Network } from "core/types";

import {
  composeValidators,
  isLink,
  maxLength,
  minLength,
  required,
  validateCurrencySymbol,
  withHumanDelay,
  focusOnErrors,
} from "app/utils";
import { useDialog } from "app/hooks/dialog";
import { useToast } from "app/hooks/toast";

import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as PasteIcon } from "app/icons/paste.svg";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as DeleteIcon } from "app/icons/Delete.svg";
import { ReactComponent as EditIcon } from "app/icons/edit-medium.svg";
import { ReactComponent as SelectedIcon } from "app/icons/SelectCheck.svg";

import Input from "../elements/Input";
import Button from "../elements/Button";
import NumberInput from "../elements/NumberInput";
import LongTextField, { LongTextFieldProps } from "../elements/LongTextField";
import ScrollAreaContainer from "../elements/ScrollAreaContainer";
import IconedButton from "../elements/IconedButton";

type FormValues = {
  nName: string;
  rpcUrl: string;
  chainId: number;
  currencySymbol: string;
  blockExplorer: string;
};

type EditNetworkProps = {
  isNew: boolean;
  network?: Network;
  onCancelHandler: () => void;
  onActionFinished?: (toTop?: boolean) => void;
  className?: string;
};

const EditNetwork = memo<EditNetworkProps>(
  ({ isNew, network, onCancelHandler, onActionFinished }) => {
    const { alert, confirm } = useDialog();
    const { updateToast } = useToast();

    const initialChainId = useMemo(() => network?.chainId, [network?.chainId]);

    const handleSubmit = useCallback(
      async ({ nName, rpcUrl, chainId, currencySymbol, blockExplorer }) =>
        withHumanDelay(async () => {
          chainId = Number(chainId);

          try {
            const isChangedChainId =
              initialChainId && chainId !== initialChainId;

            const repoMethod = isNew || isChangedChainId ? "add" : "put";

            await Repo.networks[repoMethod](
              network
                ? {
                    ...network,
                    chainId,
                    name: nName,
                    nativeCurrency: {
                      ...network.nativeCurrency,
                      symbol: currencySymbol,
                      name:
                        network.type === "unknown"
                          ? currencySymbol
                          : network.nativeCurrency.name,
                    },
                    rpcUrls: mergeNetworkUrls([rpcUrl], network.rpcUrls),
                    explorerUrls: blockExplorer
                      ? mergeNetworkUrls([blockExplorer], network.explorerUrls)
                      : network.explorerUrls,
                  }
                : {
                    chainId,
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
                  }
            );

            if (network) {
              await setRpcUrl(
                chainId,
                rpcUrl !== network.rpcUrls[0] ? rpcUrl : null
              );
            }

            if (isChangedChainId) {
              await cleanupNetwork(initialChainId);
            }

            if (isNew && onActionFinished) {
              onActionFinished();
            }

            updateToast(
              isNew
                ? `Network ${
                    network?.name ? `"${network?.name}"` : ""
                  } successfully created!`
                : `Network ${
                    network?.name ? `"${network?.name}"` : ""
                  } successfully updated!`
            );
            onCancelHandler();
          } catch (err: any) {
            alert({ title: "Error!", content: err.message });
          }
        }),
      [
        initialChainId,
        isNew,
        network,
        onActionFinished,
        updateToast,
        onCancelHandler,
        alert,
      ]
    );

    const deleteNetwork = useCallback(async () => {
      const response = await confirm({
        title: "Delete network",
        content: (
          <p className="mb-4 mx-auto max-w-[20rem] text-center">
            Are you sure you want to delete <b>{network?.name ?? "this"}</b>{" "}
            network with chain id <b>{initialChainId}</b>?
          </p>
        ),
        yesButtonText: "Delete",
      });

      if (response) {
        await cleanupNetwork(initialChainId!);
        onActionFinished?.(true);
        updateToast(
          `Network ${
            network?.name ? `"${network?.name}"` : ""
          } successfully deleted!`
        );
      }
    }, [confirm, initialChainId, network?.name, onActionFinished, updateToast]);

    const isNative = network && network.type !== "unknown";

    return (
      <section className={classNames("flex flex-col grow")}>
        <header className="flex items-center ml-6 pb-3">
          {isNew ? (
            <>
              <PlusCircleIcon className="w-8 h-auto mr-3" />
              <h3 className="text-brand-light text-2xl font-bold">
                Add new network
              </h3>
            </>
          ) : (
            <div className="w-[21.875rem] flex items-center justify-between">
              <div className="flex">
                <EditIcon className="w-8 h-auto mr-3" />
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
          className={classNames("flex flex-col")}
          viewPortClassName="pb-20 rounded-t-[.625rem] pl-6 pt-3"
          scrollBarClassName="py-0 pb-20"
        >
          <Form<FormValues>
            onSubmit={handleSubmit}
            decorators={[focusOnErrors]}
            initialValues={{
              nName: network?.name,
              chainId: network?.chainId,
              currencySymbol: network?.nativeCurrency?.symbol,
              blockExplorer: network?.explorerUrls?.[0],
            }}
            render={({ form, handleSubmit, submitting }) => (
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
                      maxLength(256)
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
                      <RPCField
                        label="RPC URL"
                        placeholder="Insert rpc url"
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        className="mt-4"
                        textareaClassName="!h-[4.5rem]"
                        formApi={form}
                        meta={meta}
                        network={network}
                        {...input}
                      />
                    )}
                  </Field>
                  <Field
                    name="chainId"
                    validate={composeValidators(
                      required,
                      minLength(1),
                      maxLength(16)
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
                    validate={composeValidators(
                      required,
                      minLength(2),
                      maxLength(8),
                      validateCurrencySymbol
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
                  <Field
                    name="blockExplorer"
                    validate={composeValidators(
                      isLink,
                      isNative ? required : undefined
                    )}
                  >
                    {({ input, meta }) => (
                      <Input
                        label="Block explorer"
                        placeholder="Insert block explorer link"
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        optional={!isNative}
                        className="mt-4"
                        inputClassName="h-11"
                        {...input}
                      />
                    )}
                  </Field>
                  <div className="flex mt-6">
                    <Button
                      theme="secondary"
                      onClick={onCancelHandler}
                      className="!py-2 w-full"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="!py-2 ml-4 w-full"
                      loading={submitting}
                    >
                      {isNew ? "Add" : "Save"}
                    </Button>
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

type RPCFieldProps = LongTextFieldProps & {
  formApi: FormApi<FormValues, Partial<FormValues>>;
  meta: FieldMetaState<any>;
  network?: Network;
};

const RPCField = forwardRef<HTMLTextAreaElement, RPCFieldProps>(
  ({ formApi, meta, network, ...rest }, ref) => {
    const setValue = useThrottledCallback(
      (value) => formApi.change("rpcUrl", value),
      300
    );

    const { paste, pasted } = usePasteFromClipboard(setValue);
    const [opened, setOpened] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<number | null>(0);
    const [savedRpcUrl, setSavedRpcUrl] = useState<string>();

    const rpcList = useMemo(() => {
      if (!network) return undefined;
      if (!savedRpcUrl) return network.rpcUrls;

      return mergeNetworkUrls(network.rpcUrls, [savedRpcUrl]);
    }, [network, savedRpcUrl]);

    useEffect(() => {
      if (network) {
        storage
          .fetchForce<string>(getRpcUrlKey(network.chainId))
          .then((saved) => {
            setValue(saved ?? network.rpcUrls[0]);
            if (saved) setSavedRpcUrl(saved);
          })
          .catch(console.error);
      }
    }, [network, setValue, setSavedRpcUrl]);

    useEffect(() => {
      if (meta.active) {
        setOpened(true);
      } else {
        setOpened(false);
      }
    }, [meta.active]);

    useEffect(() => {
      if (rpcList && rest.value) {
        let index = 0;
        let found = false;
        for (const rpc of rpcList) {
          if (rpc.includes(rest.value as string)) {
            setActiveSuggestion(index);
            found = true;
            break;
          }
          index++;
        }
        if (!found) {
          setActiveSuggestion(null);
        }
      }
    }, [rest.value, rpcList]);

    const handleKeyClick = useCallback(
      (e) => {
        if (rpcList) {
          if (e.keyCode === 40) {
            setActiveSuggestion((prevState) =>
              prevState === null
                ? 0
                : prevState + 1 > rpcList.length - 1
                ? 0
                : prevState + 1
            );
            e.preventDefault();
          }
          if (e.keyCode === 38) {
            setActiveSuggestion((prevState) =>
              prevState === null
                ? 0
                : prevState - 1 < 0
                ? rpcList.length - 1
                : prevState - 1
            );
            e.preventDefault();
          }
          if (e.keyCode === 32 || e.keyCode === 13) {
            if (activeSuggestion !== null) {
              setValue(rpcList[activeSuggestion]);
            }
            (document.activeElement as any)?.blur();
            e.preventDefault();
          }
        }
        rest.onKeyDown?.(e);
      },
      [activeSuggestion, rest, rpcList, setValue]
    );

    const content = (
      <LongTextField
        ref={ref}
        onKeyDown={handleKeyClick}
        actions={
          <Button
            theme="tertiary"
            onClick={paste}
            className={classNames(
              "absolute bottom-3 right-3",
              "text-sm text-brand-light",
              "!p-0 !pr-1 !min-w-0",
              "!font-normal",
              "items-center"
            )}
          >
            {pasted ? (
              <SuccessIcon className="mr-1" />
            ) : (
              <PasteIcon className="mr-1" />
            )}
            {pasted ? "Pasted" : "Paste"}
          </Button>
        }
        {...rest}
        error={opened ? undefined : rest.error}
      />
    );

    if (rpcList && rpcList.length > 0) {
      return (
        <Popover.Root
          open={opened}
          modal={false}
          onOpenChange={() => undefined}
        >
          <Popover.Trigger className="w-full" asChild>
            {content}
          </Popover.Trigger>
          <Popover.Content
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            className={classNames(
              "shadow-xs",
              "focus-visible:outline-none",
              "mt-2",
              "w-full min-w-[17.75rem]",
              "rounded-[.625rem]",
              // "bg-brand-dark/10",
              // "backdrop-blur-[30px]",
              "!bg-[#111226]", // TODO: firefox:
              "border border-brand-light/5",
              "z-10",
              "w-[21.875rem]"
            )}
          >
            <ScrollAreaContainer
              className={classNames("max-h-64 pl-3 pr-4", "flex flex-col")}
              viewPortClassName="py-3 viewportBlock"
              scrollBarClassName="py-3"
            >
              {rpcList.map((item, index) => (
                <button
                  type="button"
                  key={item}
                  className={classNames(
                    "w-full mb-1 last:mb-0",
                    "flex items-center",
                    "px-3",
                    item === rpcList[0] ? "py-1.5" : "py-2",
                    "rounded-[.625rem]",
                    "cursor-pointer",
                    "text-sm",
                    "outline-none",
                    "transition-colors",
                    activeSuggestion === index && "bg-brand-main/20"
                  )}
                  onPointerDown={() => setValue(item)}
                  onMouseOver={() =>
                    setActiveSuggestion(rpcList?.indexOf(item))
                  }
                  onFocus={() => setActiveSuggestion(rpcList?.indexOf(item))}
                >
                  <span className="min-w-0 truncate">{item}</span>
                  {item === rpcList[0] && (
                    <SelectedIcon className="w-6 min-w-[1.5rem] h-auto ml-auto" />
                  )}
                </button>
              ))}
            </ScrollAreaContainer>
          </Popover.Content>
        </Popover.Root>
      );
    }

    return content;
  }
);
