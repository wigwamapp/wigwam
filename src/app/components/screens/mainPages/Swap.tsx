import { FC, useMemo } from "react";
import { LiFiWidget, WidgetConfig } from "../../../../../packages/lifi-widget";
import { getLiFiProvider } from "core/client/lifi-provider";
import { useAccounts, useChainId } from "app/hooks";
import { tokenSlugAtom } from "app/atoms";
import { useAtomValue } from "jotai";
import { parseTokenSlug } from "core/common/tokens";

const Swap: FC = () => {
  const { currentAccount } = useAccounts();
  const chainId = useChainId();
  const tokenSlug = useAtomValue(tokenSlugAtom);

  const widgetConfig = useMemo((): WidgetConfig => {
    return {
      integrator: "Wigwam",
      variant: "expandable",
      fromChain: chainId,
      fromToken: tokenSlug ? parseTokenSlug(tokenSlug).address : undefined,
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
