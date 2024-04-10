import { FC, useMemo, useEffect, useState, useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";
import memoize from "mem";

import {
  LiFiWidget,
  WidgetConfig,
  RouteExecutionUpdate,
  useWidgetEvents,
  WidgetEvent,
} from "packages/lifi-widget";
import { getLiFiProvider } from "core/client/lifi-provider";
import { useAtomsAll, useLazyAtomValue } from "lib/atom-utils";
import { useAccounts, useChainId } from "app/hooks";
import {
  tokenSlugAtom,
  currenciesRateAtom,
  selectedCurrencyAtom,
  getAllNativeTokensAtom,
  swapVerifiedTokensAtom,
} from "app/atoms";

import { parseTokenSlug } from "core/common/tokens";
import { ZeroAddress } from "ethers";
import { SelfActivityKind } from "core/types";
import { Route } from "@lifi/types";
import { currentLocaleAtom } from "app/atoms";
import { LanguageKey } from "packages/lifi-widget/providers";
import axios from "axios";

const resources = [
  "https://cloudflare-ipfs.com/ipns/tokens.uniswap.org",
  "https://cloudflare-ipfs.com/ipns/extendedtokens.uniswap.org",
];

const getVerifiedTokens = memoize(
  async () => {
    const tokenPromises = resources.map((url) =>
      axios.get(url).then((response) => response.data.tokens),
    );

    const response = await Promise.all(tokenPromises);
    const fullTokensList = response.reduce((acc, curr) => {
      return [...acc, ...curr];
    }, []);

    const networks: number[] = [];

    fullTokensList.forEach((token: any) => {
      if (!networks.includes(token.chainId)) {
        networks.push(token.chainId);
      }
    });

    const nativeTokens = networks.map((token) => {
      return {
        address: ZeroAddress,
        chainId: token,
      };
    });

    return [
      ...fullTokensList.map((item: any) => ({
        address: item.address,
        chainId: item.chainId,
      })),
      ...nativeTokens,
    ];
  },
  {
    maxAge: 400_000,
    cacheKey: (args) => args.join("_"),
  },
);

const Swap: FC = () => {
  const currentLocale = useAtomValue(currentLocaleAtom);
  const { currentAccount } = useAccounts();
  const chainId = useChainId();
  const tokenSlug = useAtomValue(tokenSlugAtom);
  const [fee, setFee] = useState<number | undefined>(0.01);
  const [chainsOrder, setChainsOrder] = useState<number[] | null>(null);

  const accountNativeTokens = useLazyAtomValue(
    getAllNativeTokensAtom(currentAccount.address),
    "off",
  );

  const balancesMap = useMemo(
    () =>
      accountNativeTokens
        ? new Map(accountNativeTokens.map((t) => [t.chainId, t.portfolioUSD]))
        : null,
    [accountNativeTokens],
  );

  const [currenciesRate, selectedCurrency] = useAtomsAll([
    currenciesRateAtom,
    selectedCurrencyAtom,
  ]);

  useEffect(() => {
    if (balancesMap) {
      const arrayFromMap = Array.from(balancesMap);
      const sortedArray = arrayFromMap.sort(
        (a: any, b: any) => parseFloat(b[1]) - parseFloat(a[1]),
      );
      const sortedChainIds = sortedArray.map(([chainId]) => chainId);
      setChainsOrder(sortedChainIds as number[]);
    }
  }, [balancesMap]);

  const widgetEvents = useWidgetEvents();

  useEffect(() => {
    const onRouteExecutionStarted = (route: any) => {
      console.log("onRouteExecutionStarted fired.", route);
    };
    const onRouteExecutionUpdated = (update: RouteExecutionUpdate) => {
      console.log("onRouteExecutionUpdated fired.", update);
    };
    const onRouteExecutionCompleted = (route: any) => {
      console.log("onRouteExecutionCompleted fired.", route);
    };
    const onRouteExecutionFailed = (update: RouteExecutionUpdate) => {
      console.log("onRouteExecutionFailed fired.", update);
    };
    const onRouteHighValueLoss = (update: any) => {
      console.log("onRouteHighValueLoss continued.", update);
    };

    const onWalletConnected = () => {
      console.log("onWalletConnected");
    };

    widgetEvents.on(WidgetEvent.RouteExecutionStarted, onRouteExecutionStarted);
    widgetEvents.on(WidgetEvent.RouteExecutionUpdated, onRouteExecutionUpdated);
    widgetEvents.on(
      WidgetEvent.RouteExecutionCompleted,
      onRouteExecutionCompleted,
    );
    widgetEvents.on(WidgetEvent.RouteExecutionFailed, onRouteExecutionFailed);
    widgetEvents.on(WidgetEvent.RouteHighValueLoss, onRouteHighValueLoss);
    widgetEvents.on(WidgetEvent.WalletConnected, onWalletConnected);
    return () => widgetEvents.all.clear();
  }, [widgetEvents]);

  const provider = getLiFiProvider(chainId);
  const signer = provider.getSigner(currentAccount.address);

  const [verifiedTokens, setVerifiedTokens] = useState<null | any>(null);

  const handleGetVerifiedTokens = useCallback(async () => {
    const tokens = await getVerifiedTokens();
    setVerifiedTokens(tokens);
  }, []);

  useEffect(() => {
    handleGetVerifiedTokens();
  }, [handleGetVerifiedTokens]);

  const handleBeforeTransaction = useCallback((metadata: Route) => {
    if (metadata) {
      const transactionProvider = getLiFiProvider(metadata.fromChainId);

      transactionProvider.setActivitySource({
        type: "self",
        kind: SelfActivityKind.Swap,
        swapMeta: metadata,
      });
    }
  }, []);

  const handleChangeFee = useCallback((newFee: undefined | number) => {
    setFee(newFee);
  }, []);

  const [showOnlyVerified, setShowOnlyVerified] = useAtom(
    swapVerifiedTokensAtom,
  );

  const handleShowFullList = useCallback(
    (flag: any) => {
      setShowOnlyVerified(flag);
    },
    [setShowOnlyVerified],
  );

  const tokensList = useMemo(() => {
    return showOnlyVerified ? verifiedTokens : [];
  }, [showOnlyVerified, verifiedTokens]);

  const widgetConfig = useMemo((): WidgetConfig => {
    return {
      onBeforeTransaction: (metadata: Route) =>
        handleBeforeTransaction(metadata),
      onChangeFee: (newFee: number | undefined) => handleChangeFee(newFee),
      onShowFullList: (flag: boolean) => handleShowFullList(flag),
      integrator: "Wigwam",
      variant: "expandable",
      selectedCurrency: selectedCurrency,
      currencyRate: currenciesRate[selectedCurrency],
      chainsOrder: chainsOrder,
      showOnlyVerified: showOnlyVerified,
      languages: {
        default: currentLocale as LanguageKey,
      },
      tokens: {
        allow: tokensList,
      },
      fee: fee,
      fromChain: chainId,
      fromToken: tokenSlug
        ? parseTokenSlug(tokenSlug).address === "0"
          ? ZeroAddress
          : parseTokenSlug(tokenSlug).address
        : undefined,
      containerStyle: {
        borderRadius: "10px",
      },
      sdkConfig: {
        apiUrl: "https://li.quest/v1",
        defaultRouteOptions: {
          infiniteApproval: true,
        },
      },
      chains: {
        deny: [66, 122, 1101],
      },
      appearance: "dark",
      hiddenUI: ["appearance", "poweredBy"],
      theme: {
        palette: {
          background: {
            paper: "#2b3037",
            default: "#181a1f", // bg color container
          },
        },
        shape: {
          borderRadius: 10,
          borderRadiusSecondary: 10,
        },
        typography: {
          fontFamily: "Inter",
        },
      },
      walletManagement: {
        signer,
        connect: async () => {
          const signer = getLiFiProvider(chainId).getSigner(
            currentAccount.address,
          );
          return signer;
        },
        disconnect: async () => {
          console.log("disconnect");
        },
        switchChain: async (chainId: number) => {
          const newSigner = getLiFiProvider(chainId).getSigner(
            currentAccount.address,
          );
          if (newSigner) {
            return newSigner;
          } else {
            throw Error("No signer object is found after the chain switch.");
          }
        },
      },
    };
  }, [
    tokensList,
    currenciesRate,
    currentLocale,
    chainId,
    currentAccount.address,
    showOnlyVerified,
    tokenSlug,
    fee,
    signer,
    selectedCurrency,
    handleShowFullList,
    handleBeforeTransaction,
    handleChangeFee,
    chainsOrder,
  ]);

  return (
    <div className="flex mt-[1rem] h-full overflow-x-auto overflow-y-hidden scrollbar-hide">
      <LiFiWidget
        currencyRate={widgetConfig.currencyRate}
        selectedCurrency={selectedCurrency}
        integrator={widgetConfig.integrator}
        chainsOrder={chainsOrder}
        config={widgetConfig}
      />
    </div>
  );
};

export default Swap;
