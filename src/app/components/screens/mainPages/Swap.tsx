import { FC, useMemo, useEffect } from "react";
import { LiFiWidget, WidgetConfig } from "../../../../../packages/lifi-widget";
import { getLiFiProvider } from "core/client/lifi-provider";
import { useAccounts, useChainId } from "app/hooks";
import { tokenSlugAtom } from "app/atoms";
import { useAtomValue } from "jotai";
import { parseTokenSlug } from "core/common/tokens";
import { ZeroAddress } from "ethers";
import type { RouteExecutionUpdate } from "../../../../../packages/lifi-widget";
import {
  useWidgetEvents,
  WidgetEvent,
} from "../../../../../packages/lifi-widget";

const Swap: FC = () => {
  const { currentAccount } = useAccounts();
  const chainId = useChainId();
  const tokenSlug = useAtomValue(tokenSlugAtom);

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
      console.log("CONNECTED");
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

  const widgetConfig = useMemo((): WidgetConfig => {
    return {
      integrator: "Wigwam",
      variant: "expandable",
      fromChain: chainId,
      fromToken: tokenSlug
        ? parseTokenSlug(tokenSlug).address === "0"
          ? ZeroAddress
          : parseTokenSlug(tokenSlug).address
        : undefined,
      containerStyle: {
        borderRadius: "16px",
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
      hiddenUI: ["appearance"],
      theme: {
        palette: {
          background: {
            paper: "#191b2e",
            default: "#101123", // bg color container
          },
        },
        shape: {
          borderRadius: 16,
          borderRadiusSecondary: 16,
        },
        typography: {
          fontFamily: "Inter",
        },
      },
      walletManagement: {
        signer: getLiFiProvider(chainId).getSigner(currentAccount.address),
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
  }, [chainId, currentAccount.address, tokenSlug]);

  return (
    <div className="flex mt-[1rem]">
      <LiFiWidget integrator={widgetConfig.integrator} config={widgetConfig} />
    </div>
  );
};

export default Swap;
