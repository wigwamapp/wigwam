import {
  ButtonHTMLAttributes,
  KeyboardEventHandler,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { mergeRefs } from "react-merge-refs";
import { Field, FieldMetaState, Form } from "react-final-form";
import { FormApi } from "final-form";
import { useThrottledCallback } from "use-debounce";
import * as Popover from "@radix-ui/react-popover";
import { usePasteFromClipboard } from "lib/react-hooks/usePasteFromClipboard";
import { storage } from "lib/ext/storage";
import { useOnScreen } from "lib/react-hooks/useOnScreen";

import { DEFAULT_CHAIN_IDS } from "fixtures/networks";
import * as Repo from "core/repo";
import {
  Setting,
  cleanupNetwork,
  getRpcUrlKey,
  mergeNetworkUrls,
  setRpcUrl,
} from "core/common";
import { Network } from "core/types";
import { TEvent, trackEvent } from "core/client";

import { IS_FIREFOX } from "app/defaults";
import {
  composeValidators,
  isUrlLike,
  maxLength,
  minLength,
  required,
  validateCurrencySymbol,
  withHumanDelay,
  focusOnErrors,
  preventXSS,
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
      async ({
        nName,
        rpcUrl,
        chainId,
        currencySymbol,
        blockExplorer,
      }: FormValues) =>
        withHumanDelay(async () => {
          chainId = Number(chainId);

          try {
            const isChangedChainId =
              initialChainId && chainId !== initialChainId;

            const repoMethod = isNew || isChangedChainId ? "add" : "put";

            if (repoMethod === "add") {
              await storage.put(Setting.TestNetworks, true);
            }

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
                      ? mergeNetworkUrls(network.explorerUrls, [blockExplorer])
                      : [],
                    manuallyChanged: true,
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
                    explorerUrls: blockExplorer ? [blockExplorer] : [],
                    position: 0,
                  },
            );

            if (network) {
              await setRpcUrl(
                chainId,
                rpcUrl !== network.rpcUrls[0] ? rpcUrl : null,
              );
            }

            if (isChangedChainId) {
              await cleanupNetwork(initialChainId);
            }

            if (isNew) {
              trackEvent(TEvent.NetworkCreation);
            } else {
              const isDefault = DEFAULT_CHAIN_IDS.has(chainId);
              trackEvent(TEvent.NetworkEdit, {
                name: isDefault ? nName : "unknown",
                chainId: isDefault ? chainId : "unknown",
              });
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
                  } successfully updated!`,
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
      ],
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
          } successfully deleted!`,
        );
      }
    }, [confirm, initialChainId, network?.name, onActionFinished, updateToast]);

    const isNative = network && DEFAULT_CHAIN_IDS.has(network.chainId);

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
          viewPortClassName="pb-5 rounded-t-[.625rem] pl-6 pt-3"
          scrollBarClassName="py-0 pb-5"
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
                      maxLength(256),
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
                        // Focus on init
                        // EditNetwork has 3th depth level of settings
                        // Required for case when viewport width too small
                        autoFocus
                        {...input}
                      />
                    )}
                  </Field>
                  <Field
                    name="rpcUrl"
                    validate={composeValidators(
                      required,
                      isUrlLike,
                      preventXSS,
                    )}
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
                      maxLength(16),
                    )}
                  >
                    {({ input, meta }) => (
                      <NumberInput
                        label="Chain ID"
                        placeholder="Type chain id"
                        decimalScale={0}
                        thousandSeparator={false}
                        error={meta.error && meta.touched}
                        errorMessage={meta.error}
                        readOnly={!isNew}
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
                      validateCurrencySymbol,
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
                    validate={(value) =>
                      value
                        ? composeValidators(isUrlLike, preventXSS)(value)
                        : undefined
                    }
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
  },
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
      300,
    );

    const { paste, pasted } = usePasteFromClipboard(setValue);
    const [opened, setOpened] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<number | null>(0);
    const [savedRpcUrl, setSavedRpcUrl] = useState<string>();
    const [isAfterArrowClick, setIsAfterArrowClick] = useState(false);

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
        setTimeout(() => {
          setOpened((prevState) => {
            if (!prevState) {
              setActiveSuggestion(0);
            }
            return true;
          });
        }, 50);
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

    const handleKeyClick = useCallback<
      KeyboardEventHandler<HTMLTextAreaElement>
    >(
      (e) => {
        if (rpcList) {
          if (e.keyCode === 40) {
            setActiveSuggestion((prevState) =>
              prevState === null
                ? 0
                : prevState + 1 > rpcList.length - 1
                  ? 0
                  : prevState + 1,
            );
            setIsAfterArrowClick(true);
            e.preventDefault();
          }
          if (e.keyCode === 38) {
            setActiveSuggestion((prevState) =>
              prevState === null
                ? 0
                : prevState - 1 < 0
                  ? rpcList.length - 1
                  : prevState - 1,
            );
            setIsAfterArrowClick(true);
            e.preventDefault();
          }
          if (e.keyCode === 32 || e.keyCode === 13) {
            if (activeSuggestion !== null) {
              setValue(rpcList[activeSuggestion]);
            }
            // (document.activeElement as any)?.blur();
            e.preventDefault();
          }
        }
        rest.onKeyDown?.(e);
      },
      [activeSuggestion, rest, rpcList, setValue],
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
              "items-center",
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
            side="bottom"
            align="start"
            avoidCollisions={false}
            style={{
              width: "var(--radix-popover-trigger-width)",
            }}
            className={classNames(
              "shadow-xs",
              "focus-visible:outline-none",
              "mt-2",
              "w-full min-w-[17.75rem]",
              "rounded-[.625rem]",
              "bg-brand-darkgray",
              IS_FIREFOX && "!bg-[#13191F]",
              "border border-brand-light/5",
              "z-10",
              "w-[21.875rem]",
            )}
          >
            <ScrollAreaContainer
              className={classNames("max-h-64 pl-3 pr-4", "flex flex-col")}
              viewPortClassName="py-3 viewportBlock"
              scrollBarClassName="py-3"
            >
              {rpcList.map((item, index) => (
                <NetworkButton
                  key={item}
                  network={item}
                  isSelected={item === rest.value}
                  isActive={activeSuggestion === index}
                  isAfterArrowClick={isAfterArrowClick}
                  onPointerDown={(evt) => {
                    evt.preventDefault();
                    setValue(item);
                    // (document.activeElement as any)?.blur();
                  }}
                  onMouseOver={() => {
                    setActiveSuggestion(rpcList?.indexOf(item));
                    setIsAfterArrowClick(false);
                  }}
                  onFocus={() => setActiveSuggestion(rpcList?.indexOf(item))}
                />
              ))}
            </ScrollAreaContainer>
          </Popover.Content>
        </Popover.Root>
      );
    }

    return content;
  },
);

type NetworkButtonProps = {
  network: string;
  isActive?: boolean;
  isSelected?: boolean;
  isAfterArrowClick?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const NetworkButton = forwardRef<HTMLButtonElement, NetworkButtonProps>(
  ({ isActive, isSelected, isAfterArrowClick, network, ...rest }, ref) => {
    const elementRef = useRef<HTMLButtonElement>(null);
    const onScreen = useOnScreen(elementRef);

    useEffect(() => {
      if (isActive && isAfterArrowClick && !onScreen) {
        elementRef.current?.scrollIntoView();
      }
    }, [isActive, isAfterArrowClick, onScreen]);

    return (
      <button
        ref={mergeRefs([ref, elementRef])}
        type="button"
        key={network}
        className={classNames(
          "w-full",
          "flex items-center",
          "px-3",
          isSelected ? "py-2" : "py-2.5",
          "rounded-[.625rem]",
          "cursor-pointer",
          "text-sm",
          "outline-none",
          "transition-colors",
          isActive && "bg-brand-main/20",
        )}
        {...rest}
      >
        <span className="min-w-0 truncate">{network}</span>
        {isSelected && (
          <SelectedIcon className="w-6 min-w-[1.5rem] h-auto ml-auto" />
        )}
      </button>
    );
  },
);
