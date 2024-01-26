import { FC, useMemo, useEffect, useState, useCallback } from "react";
import { useAtomValue } from "jotai";

import {
  LiFiWidget,
  WidgetConfig,
  RouteExecutionUpdate,
  useWidgetEvents,
  WidgetEvent,
} from "packages/lifi-widget";
import { getLiFiProvider } from "core/client/lifi-provider";
import { useAtomsAll } from "lib/atom-utils";
import { useAccounts, useChainId } from "app/hooks";
import {
  tokenSlugAtom,
  currenciesRateAtom,
  selectedCurrencyAtom,
} from "app/atoms";
import { parseTokenSlug } from "core/common/tokens";
import { ZeroAddress } from "ethers";
import { SelfActivityKind } from "core/types";
import { Route } from "@lifi/types";
import { ERC721__factory } from "abi-types";
import { getClientProvider } from "core/client";
import { currentLocaleAtom } from "app/atoms";
import { LanguageKey } from "packages/lifi-widget/providers";

const DEV_NFT_ADDRESS = "0xe4aEA1A2127bFa86FEE9D43a8F471e1D41648A9e";
const DEV_NFT_CHAIN = 137;

const Swap: FC = () => {
  const currentLocale = useAtomValue(currentLocaleAtom);
  const { currentAccount } = useAccounts();
  const chainId = useChainId();
  const tokenSlug = useAtomValue(tokenSlugAtom);
  const [fee, setFee] = useState(0.01);

  const [currenciesRate, selectedCurrency] = useAtomsAll([
    currenciesRateAtom,
    selectedCurrencyAtom,
  ]);

  useEffect(() => {
    console.log("currenciesRate", currenciesRate);
    console.log("selectedCurrency", selectedCurrency);
  }, [currenciesRate, selectedCurrency]);

  const getDevNftBalance = async () => {
    const polygonProvider = getClientProvider(DEV_NFT_CHAIN).getUncheckedSigner(
      currentAccount.address,
    );
    const contract = ERC721__factory.connect(DEV_NFT_ADDRESS, polygonProvider);
    const nftBalance = await contract.balanceOf(currentAccount.address);

    if (Boolean(nftBalance)) {
      setFee(0);
    }
  };

  useEffect(() => {
    getDevNftBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount.address]);

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

  const handleBeforeTransaction = useCallback(
    (metadata: Route) => {
      if (metadata) {
        provider.setActivitySource({
          type: "self",
          kind: SelfActivityKind.Swap,
          swapMeta: metadata,
        });
      }
    },
    [provider],
  );

  const widgetConfig = useMemo((): WidgetConfig => {
    return {
      onBeforeTransaction: (metadata: Route) =>
        handleBeforeTransaction(metadata),
      integrator: "Wigwam",
      variant: "expandable",
      selectedCurrency: selectedCurrency,
      currencyRate: currenciesRate[selectedCurrency],
      languages: {
        default: currentLocale as LanguageKey,
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
    currenciesRate,
    currentLocale,
    chainId,
    currentAccount.address,
    tokenSlug,
    fee,
    signer,
    selectedCurrency,
    handleBeforeTransaction,
  ]);

  return (
    <div className="flex mt-[1rem] h-full overflow-hidden">
      <LiFiWidget
        currencyRate={widgetConfig.currencyRate}
        selectedCurrency={selectedCurrency}
        integrator={widgetConfig.integrator}
        config={widgetConfig}
      />
    </div>
  );
};

export default Swap;
