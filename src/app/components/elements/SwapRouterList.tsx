import { FC } from "react";
import { Route } from "@lifi/sdk";
import BigNumber from "bignumber.js";

type SwapRouterListProps = {
  routes: Route[];
  toTokenLogoUrl?: string;
  outputChainName?: string;
};

const SwapRouterList: FC<SwapRouterListProps> = ({
  routes,
  toTokenLogoUrl,
  outputChainName,
}) => (
  <div className="flex flex-col">
    {routes.map((route: Route) => {
      return (
        <div
          key={route.id}
          className="bg-[rgba(245,181,255,0.12)] max-w-md w-full flex flex-col mb-4 p-4 border border-gray-300 rounded-md"
        >
          <div className="flex">
            <img
              alt={route.toToken.symbol}
              src={toTokenLogoUrl}
              className="max-w-[32px] max-h-[32px] rounded-full"
            />
            <div className="flex flex-col ml-[1rem]">
              <div className="text-lg font-bold">
                {new BigNumber(route.toAmount)
                  .dividedBy(new BigNumber(10).pow(route.toToken.decimals))
                  .toNumber() // Convert to a JavaScript number
                  .toLocaleString("en-US", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 4,
                  })}
              </div>
              <div className="flex mt-1 font-small color-[rgba(255, 255, 255, 0.7)]">
                ${route.toAmountUSD} • {route.toToken.symbol} on{" "}
                {outputChainName}
              </div>
            </div>
          </div>
          <div>
            <ul>
              {route.steps.map((step) => {
                return step.includedSteps.map((includedStep) => {
                  return (
                    <li
                      className="flex flex-col mt-2 mb-2 font-medium"
                      key={includedStep.id}
                    >
                      <div className="flex">
                        <span>{`${includedStep.type} via ${includedStep.toolDetails.name}`}</span>{" "}
                        <img
                          alt={includedStep.toolDetails.name}
                          src={includedStep.toolDetails.logoURI}
                          className="h-[16px] w-[16px] rounded-full ml-1"
                        />
                      </div>
                      <div>
                        <span>
                          {new BigNumber(includedStep.action.fromAmount)
                            .dividedBy(
                              new BigNumber(10).pow(
                                includedStep.action.fromToken.decimals,
                              ),
                            )
                            .toNumber() // Convert to a JavaScript number
                            .toLocaleString("en-US", {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 4,
                            })}{" "}
                          {includedStep.action.fromToken.symbol}
                        </span>
                        &rarr;
                        <span>
                          {new BigNumber(includedStep.estimate.toAmount)
                            .dividedBy(
                              new BigNumber(10).pow(
                                includedStep.action.toToken.decimals,
                              ),
                            )
                            .toNumber() // Convert to a JavaScript number
                            .toLocaleString("en-US", {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 4,
                            })}{" "}
                          {includedStep.action.toToken.symbol}
                        </span>
                      </div>
                    </li>
                  );
                });
              })}
            </ul>
          </div>
          <div className="flex mt-4">
            <div className="flex align-center">
              <svg
                className="w-[1rem] h-[1rem]"
                fill="gray"
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
                data-testid="EvStationIcon"
              >
                <path d="m19.77 7.23.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM18 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM8 18v-4.5H6L10 6v5h2l-4 7z"></path>
              </svg>
              <span className="ml-1 font-bold">{route.gasCostUSD}$</span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default SwapRouterList;
