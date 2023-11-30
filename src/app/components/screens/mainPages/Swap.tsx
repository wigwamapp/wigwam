import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiFi, RouteOptions, Route, SwitchChainHook } from "@lifi/sdk";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";
import { useAccounts, useChainId } from "app/hooks";
import { getLiFiProvider } from "core/client/lifi-provider";
import { Field, Form } from "react-final-form";
import { ERC20__factory } from "abi-types";
import { getClientProvider } from "core/client";

import axios from "axios";
import BigNumber from "bignumber.js";

import { useAtom } from "jotai";
import { useSafeState } from "lib/react-hooks/useSafeState";

import classNames from "clsx";
import { Link } from "lib/navigation";

import { composeValidators, maxValue, required } from "app/utils";

import { AccountAsset, AccountToken, TokenType, Network } from "core/types";

import { LOAD_MORE_ON_TOKEN_FROM_END } from "app/defaults";
import { tokenSlugAtom, tokenSlugOutputAtom } from "app/atoms";
import { useAccountToken, useAllAccountTokens } from "app/hooks/tokens";
import { useLazyNetwork, useLazyAllNetworks } from "app/hooks";
import { Page } from "app/nav";
import { ReactComponent as SelectedIcon } from "app/icons/SelectCheck.svg";

import Select from "app/components/elements/Select";
import PrettyAmount from "app/components/elements/PrettyAmount";
import FiatAmount from "app/components/elements/FiatAmount";
import AssetLogo from "app/components/elements/AssetLogo";
import AssetInput from "app/components/elements/AssetInput";
import InputLabelAction from "app/components/elements/InputLabelAction";
import NetworkSelectPrimitive from "app/components/elements/NetworkSelectPrimitive";

const LIFI_CONTRACT = "0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae";

const Swap: FC = () => {
  const [opened, setOpened] = useState(false);
  const [openedOutput, setOpenedOutput] = useState(false);

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [outputSearchValue, setOutputSearchValue] = useState<string | null>(
    null,
  );

  const [inputAmount, setInputAmount] = useState<string>("0");
  const [bestRoute, setBestRoute] = useState<Route | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  const [outputTokensList, setOutputTokensList] = useState<
    AccountAsset[] | null
  >();
  const [filteredOutputTokensList, setFilteredOutputTokensList] = useState<
    any | null
  >();

  useEffect(() => {
    if (!outputTokensList) return;
    console.log(outputSearchValue);
    if (outputSearchValue) {
      const normalizedQuery = outputSearchValue.toLowerCase();
      const filtered = outputTokensList
        .filter(
          (token) =>
            token.name.toLowerCase().includes(normalizedQuery) ||
            token.symbol.toLowerCase().includes(normalizedQuery) ||
            token.tokenSlug.toLowerCase().includes(normalizedQuery),
        )
        .map((token) => prepareToken(token as AccountAsset, "small", false));

      setFilteredOutputTokensList(filtered.slice(0, 50));
    } else {
      setFilteredOutputTokensList(
        outputTokensList
          .map((token) => prepareToken(token as AccountAsset, "small", false))
          .slice(0, 50),
      );
    }
  }, [outputSearchValue, outputTokensList?.length]);

  const tokenType = TokenType.Asset;

  const { currentAccount } = useAccounts();

  const chainId = useChainId();

  const lifi = new LiFi({
    integrator: "Wigwam",
  });

  const getRoutes = async () => {
    if (!currentToken || !currentTokenOutput) return;

    const routeOptions = {
      slippage: 5 / 100, // 3%
      order: "RECOMMENDED",
      infiniteApproval: true,
    } as RouteOptions;

    const routesRequest = {
      fromChainId: currentToken.chainId,
      fromAmount: new BigNumber(inputAmount)
        .multipliedBy(new BigNumber(10).pow(tokenDecimals))
        .toString(), // 1USDT
      fromTokenAddress: currentToken.tokenSlug.includes("NATIVE")
        ? "0x0000000000000000000000000000000000000000"
        : currentToken.tokenSlug.replace("ERC20_", "").replace("_0", ""),
      toChainId: currentTokenOutput.chainId,
      toTokenAddress: currentTokenOutput.tokenSlug
        .replace("ERC20_", "")
        .replace("_0", ""),
      options: routeOptions,
    };

    console.log(routesRequest.fromAmount);

    const result = await lifi.getRoutes(routesRequest);
    const routes = result.routes;

    console.log(routes);

    setBestRoute(routes[0]);

    setCurrentTokenOutput({
      ...currentTokenOutput,
      balanceUSD: Number(routes[0].toAmountUSD),
      portfolioUSD: routes[0].toAmountUSD,
      priceUSD: routes[0].toToken.priceUSD,
      rawBalance: routes[0].toAmountMin,
    });

    return routes[1];

    // console.log(route)
  };

  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);

  const [tokenSlugOutput, setTokenSlugOutput] = useAtom(tokenSlugOutputAtom);

  const currentToken = useAccountToken(tokenSlug ?? NATIVE_TOKEN_SLUG);
  const [currentTokenOutput, setCurrentTokenOutput] =
    useState<AccountAsset | null>(null);

  useEffect(() => {
    if (tokenSlugOutput && outputTokensList) {
      const neededToken = outputTokensList.find(
        (item: AccountAsset) => item.tokenSlug === tokenSlugOutput,
      );
      if (neededToken) {
        setCurrentTokenOutput(neededToken);
      }
    }
  }, [tokenSlugOutput]);

  const checkIsApproved = async () => {
    if (currentToken && !currentToken.tokenSlug.includes("NATIVE")) {
      const tokenAddress = currentToken?.tokenSlug
        .replace("ERC20_", "")
        .replace("_0", "");

      const provider = getClientProvider(chainId).getUncheckedSigner(
        currentAccount.address,
      );

      const contract = ERC20__factory.connect(tokenAddress, provider);

      const txResult = await contract.allowance(
        currentAccount.address,
        LIFI_CONTRACT,
      );
      const formatedInputAmount = new BigNumber(inputAmount).multipliedBy(
        new BigNumber(10).pow(tokenDecimals),
      );
      if (Number(txResult) < formatedInputAmount.toNumber()) {
        setIsApproved(false);
      } else {
        setIsApproved(true);
      }
    } else {
      setIsApproved(true);
    }
  };

  useEffect(() => {
    checkIsApproved();
  }, [currentToken, inputAmount]);

  // let currentTokenOutput = useAccountToken(tokenSlugOutput ?? NATIVE_TOKEN_SLUG);

  const getTokens = async () => {
    if (!selectedOutputNetwork) return;
    // const optionalFilter = [56] // Both numeric and mnemonic can be used
    /// chainTypes can be of type SVM and EVM. By default, only EVM tokens will be returned
    const optionalChainTypes = "EVM";
    const {
      data: { tokens: outputTokens },
    } = await axios.get("https://li.quest/v1/tokens", {
      params: {
        // chains: optionalFilter.join(','),
        chainTypes: optionalChainTypes,
      },
    });

    const networks: string[] = [];

    for (const key in outputTokens) {
      networks.push(key);
      if (outputTokens.hasOwnProperty(key)) {
        const array = outputTokens[key];

        const filteredArray = array.filter(
          (item: any) => item.priceUSD !== "0",
        );

        const formatedTokens = filteredArray.map((item: any) => {
          return {
            chainId: item.chainId,
            accountAddress: currentAccount.address,
            tokenType: TokenType.Asset,
            status: 2,
            tokenSlug: `ERC20_${item.address}_0`,
            decimals: item.decimals,
            name: item.name,
            symbol: item.symbol,
            logoUrl: item.logoURI,
            rawBalance: "0",
            priceUSD: "0",
            portfolioUSD: "0",
            balanceUSD: 0,
          };
        });

        outputTokens[key] = formatedTokens;
      }
    }

    const filteredNetworks = allNetworks.filter((item) =>
      networks.includes(item.chainId.toString()),
    );

    console.log(outputTokens[56].filter((item: any) => item.symbol === "SNX"));

    setAllowedNetworks(filteredNetworks);

    setOutputTokensList(outputTokens[selectedOutputNetwork.chainId]);
  };

  const { tokens, loadMore, hasMore } = useAllAccountTokens(
    tokenType,
    currentAccount.address,
    {
      search: searchValue ?? undefined,
    },
  );

  const preparedTokens = useMemo(
    () =>
      tokens.map((token) =>
        prepareToken(
          token as AccountAsset,
          "small",
          token.tokenSlug === tokenSlug,
        ),
      ),
    [tokenSlug, tokens],
  );

  // const preparedOutputTokens = useMemo(
  //   () =>
  //     outputTokensList &&
  //     outputTokensList.map((token) =>
  //       prepareToken(token as AccountAsset, "small", false),
  //     ),
  //   [tokenSlug, outputTokensList],
  // );

  // useEffect(() => {
  //   console.log(preparedTokens)
  //   console.log(preparedOutputTokens)
  // }, [preparedOutputTokens, preparedTokens])

  const preparedCurrentToken = useMemo(
    () =>
      currentToken
        ? prepareToken(currentToken as AccountAsset, "large")
        : undefined,
    [currentToken],
  );

  let preparedCurrentTokenOutput = useMemo(() => {
    if (outputTokensList) {
      return currentTokenOutput
        ? prepareToken(currentTokenOutput as AccountAsset, "large")
        : prepareToken(outputTokensList[0] as AccountAsset, "large");
    } else {
      return undefined;
    }
  }, [currentTokenOutput, outputTokensList]);

  useEffect(() => {
    if (currentTokenOutput) {
      preparedCurrentTokenOutput = prepareToken(
        currentTokenOutput as AccountAsset,
        "large",
      );
    }
  }, [currentTokenOutput]);

  useEffect(() => {
    if (outputTokensList) {
      preparedCurrentTokenOutput = prepareToken(
        outputTokensList[0] as AccountAsset,
        "large",
      );
    }
  }, [outputTokensList]);

  useEffect(() => {
    if (currentToken && currentTokenOutput && Number(inputAmount) > 0) {
      getRoutes();
    }
  }, [currentToken, currentTokenOutput?.tokenSlug, inputAmount]);

  const switchChainHook: SwitchChainHook = async (requiredChainId: number) => {
    console.log("switchChainHook", requiredChainId);

    const newSigner = getLiFiProvider(requiredChainId).getSigner(
      currentAccount.address,
    );

    return newSigner;
  };

  const acceptExchangeRateUpdateHook = async () => {
    return true;
  };

  const doSwap = async () => {
    if (!currentToken || !currentTokenOutput) return;

    const routeOptions = {
      slippage: 5 / 100, // 3%
      order: "RECOMMENDED",
      infiniteApproval: true,
    } as RouteOptions;

    const routesRequest = {
      fromChainId: currentToken.chainId,
      fromAmount: new BigNumber(inputAmount)
        .multipliedBy(new BigNumber(10).pow(tokenDecimals))
        .toString(), // 1USDT
      fromTokenAddress: currentToken.tokenSlug.includes("NATIVE")
        ? "0x0000000000000000000000000000000000000000"
        : currentToken.tokenSlug.replace("ERC20_", "").replace("_0", ""),
      toChainId: currentTokenOutput.chainId,
      toTokenAddress: currentTokenOutput.tokenSlug
        .replace("ERC20_", "")
        .replace("_0", ""),
      options: routeOptions,
    };

    console.log(routesRequest.fromAmount);

    const result = await lifi.getRoutes(routesRequest);
    const latestRoute = result.routes[0];

    if (latestRoute) {
      const signerProvider = getLiFiProvider(chainId).getSigner(
        currentAccount.address,
      );
      const route = await lifi.executeRoute(signerProvider, latestRoute, {
        switchChainHook: switchChainHook,
        acceptExchangeRateUpdateHook: acceptExchangeRateUpdateHook,
      });
      console.log("route", route);
    }
  };

  const doApprove = async () => {
    console.log("chec");
    if (currentToken) {
      console.log("chec2");
      const tokenAddress = currentToken?.tokenSlug
        .replace("ERC20_", "")
        .replace("_0", "");

      const provider = getClientProvider(chainId).getUncheckedSigner(
        currentAccount.address,
      );

      const contract = ERC20__factory.connect(tokenAddress, provider);
      const formatedInputAmount = new BigNumber(inputAmount).multipliedBy(
        new BigNumber(10).pow(tokenDecimals),
      );

      await contract.approve(LIFI_CONTRACT, formatedInputAmount.toString());
    }
  };

  const handleSubmitAction = () => {
    if (isApproved) {
      doSwap();
    } else {
      doApprove();
    }
  };

  const onTokenSelect = useCallback(
    (tSlug: string) => {
      setTokenSlug([tSlug, "replace"]);
    },
    [setTokenSlug],
  );

  const onTokenSelectOutput = useCallback(
    (tSlug: string) => {
      setTokenSlugOutput([tSlug, "replace"]);
    },
    [setTokenSlugOutput],
  );

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerRef = useCallback(
    (node: HTMLElement) => {
      if (!tokens) return;

      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [hasMore, loadMore, tokens],
  );

  const [gas] = useSafeState<{
    max: bigint;
    average: bigint;
    rawBalance: bigint | null;
  }>();

  const maxAmount = useMemo(() => {
    if (!currentToken) return "0";

    const rawBalance = gas?.rawBalance?.toString() ?? currentToken.rawBalance;
    if (!rawBalance) return "0";

    let value = new BigNumber(rawBalance);

    if (currentToken.tokenSlug === NATIVE_TOKEN_SLUG) {
      value = value.minus(new BigNumber(gas ? gas.max.toString() : 0));
    }

    if (currentToken?.tokenType === TokenType.Asset) {
      value = value
        .div(new BigNumber(10).pow(currentToken.decimals.toString()))
        .decimalPlaces(Number(currentToken.decimals), BigNumber.ROUND_DOWN);
    }

    if (value.lt(0)) {
      return "0";
    }

    return value.toString();
  }, [currentToken, gas]);

  const tokenSymbol =
    currentToken?.tokenType === TokenType.Asset
      ? currentToken.symbol
      : undefined;

  const tokenDecimals =
    currentToken?.tokenType === TokenType.Asset ? currentToken.decimals : 0;

  const handleSubmit = () => {
    console.log("subm");
  };

  type FormValues = { amount: string };

  const currentNetwork = useLazyNetwork();
  const allNetworks = useLazyAllNetworks() ?? [];

  const [allowedNetworks, setAllowedNetworks] =
    useState<Network[]>(allNetworks);

  const [selectedOutputNetwork, setSelectedOutputNetwork] = useState<
    Network | undefined
  >(undefined);

  useEffect(() => {
    if (currentNetwork) {
      setSelectedOutputNetwork(currentNetwork);
    }
  }, [currentNetwork]);

  useEffect(() => {
    if (allNetworks.length > 0) {
      getTokens();
    }
  }, [selectedOutputNetwork, allNetworks]);

  const handleNetworkChange = (selectedChain: number) => {
    setSelectedOutputNetwork(
      allNetworks.find((item) => item.chainId === selectedChain),
    );
    console.log(allNetworks);
    console.log(currentNetwork);
    console.log(selectedChain);
  };

  return (
    <div className="mt-[1rem]">
      <div className="flex mb-[1rem]">
        <div className="w-[20rem]">
          <Select
            open={opened}
            onOpenChange={setOpened}
            items={preparedTokens}
            currentItem={preparedCurrentToken}
            setItem={(asset) => onTokenSelect(asset.key)}
            searchValue={searchValue}
            onSearch={setSearchValue}
            label="Token"
            itemRef={loadMoreTriggerRef}
            loadMoreOnItemFromEnd={LOAD_MORE_ON_TOKEN_FROM_END}
            showSelected
            showSelectedIcon={false}
            emptySearchText={
              <>
                You can manage your assets in the{" "}
                <Link
                  to={{ page: Page.Default }}
                  onClick={() => setOpened(false)}
                  className="underline underline-offset-2"
                >
                  Overview
                </Link>{" "}
                tab.
              </>
            }
            currentItemClassName={classNames(
              tokenType === TokenType.Asset ? "h-16" : "h-[6.125rem]",
              "!p-3",
            )}
            contentClassName="w-[23.25rem] flex flex-col"
            itemClassName="group"
          />
        </div>
        <div className="ml-[1rem]">
          <Form<FormValues>
            key={"formKey"}
            onSubmit={handleSubmit}
            render={({ form, handleSubmit }) => (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col max-w-[23.25rem]"
              >
                <div className="relative mt-5">
                  <Field
                    key={"amountFieldKey"}
                    name="amount"
                    validate={composeValidators(
                      required,
                      maxValue(maxAmount, tokenSymbol),
                    )}
                  >
                    {({ input, meta }) => (
                      <AssetInput
                        label="Amount"
                        placeholder="0"
                        thousandSeparator={true}
                        assetDecimals={tokenDecimals}
                        onInput={(e: any) =>
                          setInputAmount(
                            new BigNumber(
                              e.target.value
                                .replace(",", ".")
                                .replaceAll(" ", ""),
                            ).toString(),
                          )
                        }
                        labelActions={
                          // estimating ? (
                          //   <span className="text-xs text-brand-inactivedark2 self-end">
                          //     Estimating...
                          //   </span>
                          // ) : (
                          <InputLabelAction
                            onClick={() => {
                              form.change("amount", maxAmount);
                              console.log("maxAmount", maxAmount);
                              setInputAmount(maxAmount);
                            }}
                          >
                            MAX
                          </InputLabelAction>
                          // )
                        }
                        currency={tokenSymbol}
                        error={
                          (meta.modified || meta.submitFailed) && meta.error
                        }
                        errorMessage={meta.error}
                        readOnly={false}
                        {...input}
                      />
                    )}
                  </Field>
                </div>
                {/* <div className="mt-6 flex items-start">
              <TxCheck
                tokenType={tokenType}
                token={token}
                values={{ gas: gas?.average, ...values }}
                error={estimationError}
              />
            </div> */}
                {/* <Button
              type="submit"
              className="flex items-center min-w-[13.75rem] mt-8 mx-auto"
              loading={submitting}
            >
              <SendIcon className="mr-2" />
              Transfer
            </Button> */}
              </form>
            )}
          />
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex flex-col">
          <NetworkSelectPrimitive
            networks={allowedNetworks}
            currentNetwork={selectedOutputNetwork || currentNetwork}
            onNetworkChange={handleNetworkChange}
            className="max-w-auto"
            size={"small"}
            currentItemClassName={classNames("h-[1.75rem]")}
            currentItemIconClassName={classNames("!w-8 !h-8 !mr-3")}
            contentClassName="w-[22.25rem]"
          />
          <div className="w-[20rem]">
            {filteredOutputTokensList && (
              <Select
                open={openedOutput}
                onOpenChange={setOpenedOutput}
                items={filteredOutputTokensList}
                currentItem={preparedCurrentTokenOutput}
                setItem={(asset) => onTokenSelectOutput(asset.key)}
                searchValue={outputSearchValue}
                onSearch={setOutputSearchValue}
                label="Token Output"
                itemRef={loadMoreTriggerRef}
                loadMoreOnItemFromEnd={LOAD_MORE_ON_TOKEN_FROM_END}
                showSelected
                showSelectedIcon={false}
                emptySearchText={
                  <>
                    You can manage your assets in the{" "}
                    <Link
                      to={{ page: Page.Default }}
                      onClick={() => setOpened(false)}
                      className="underline underline-offset-2"
                    >
                      Overview
                    </Link>{" "}
                    tab.
                  </>
                }
                currentItemClassName={classNames(
                  tokenType === TokenType.Asset ? "h-16" : "h-[6.125rem]",
                  "!p-3",
                )}
                contentClassName="w-[23.25rem] flex flex-col"
                itemClassName="group"
              />
            )}
          </div>
        </div>
        <div className="ml-[1rem]">
          {bestRoute && (
            <ul className="font-sans text-base text-white-800 leading-6">
              <li>You pay: {bestRoute.fromAmountUSD} $</li>
              <li>
                Chain: ({bestRoute.fromChainId}) {`=>`} ({bestRoute.toChainId})
              </li>
              <li>Estimated fee: {bestRoute.gasCostUSD} $</li>
            </ul>
          )}
        </div>
      </div>
      <button
        className="relative overflow-hidden py-3 px-4 min-w-[10rem] text-brand-light text-base font-bold bg-buttonaccent bg-opacity-90 rounded-[.375rem] inline-flex justify-center transition hover:bg-opacity-100 hover:shadow-buttonaccent focus-visible:bg-opacity-100 focus-visible:shadow-buttonaccent active:bg-opacity-70 active:shadow-none select-none flex items-center min-w-[13.75rem] mt-8 mx-auto"
        onClick={handleSubmitAction}
      >
        {isApproved ? "Swap" : "Approve"}
      </button>
    </div>
  );
};

export default Swap;

const AssetItem: FC<{
  asset: AccountAsset;
  isSelected?: boolean;
  size?: "small" | "large";
}> = ({ asset, isSelected = false, size = "small" }) => {
  const { name, symbol, rawBalance, decimals, balanceUSD } = asset;

  return (
    <span
      className={classNames(
        "flex grow",
        "min-w-0",
        size === "large" && "mr-3",
        size === "small" && "items-center",
      )}
    >
      <span className="flex relative mr-3">
        <AssetLogo
          asset={asset}
          className={classNames(
            size === "large" && "w-10 h-10 min-w-[2.5rem]",
            size === "small" && "w-8 h-8 min-w-[2rem]",
            isSelected && "opacity-20",
          )}
        />
        {isSelected && (
          <span
            className={classNames(
              "absolute inset-0",
              "rounded-full",
              "border border-brand-light",
              "flex items-center justify-center",
            )}
          >
            <SelectedIcon className="w-6 h-auto fill-brand-light" />
          </span>
        )}
      </span>
      <span className="flex flex-col justify-between text-left grow min-w-0">
        <span className="flex justify-between">
          <span className="truncate">{symbol}</span>
          <PrettyAmount
            amount={rawBalance ?? 0}
            decimals={decimals}
            currency={symbol}
            threeDots={false}
            className="ml-2"
          />
        </span>
        <span className="flex justify-between">
          <span
            className={classNames(
              "text-xs text-brand-inactivedark font-normal",
              "truncate",
              "transition-colors",
              size === "small" && "group-hover:text-brand-light",
            )}
          >
            {name}
          </span>
          <FiatAmount
            amount={balanceUSD ?? 0}
            threeDots={false}
            className="text-xs font-normal ml-1"
          />
        </span>
      </span>
    </span>
  );
};

const prepareToken = (
  token: AccountToken,
  size: "large" | "small" = "small",
  isSelected = false,
) => ({
  key: token.tokenSlug,
  value:
    token.tokenType === TokenType.Asset ? (
      <AssetItem asset={token} size={size} isSelected={isSelected} />
    ) : (
      <></>
    ),
});
