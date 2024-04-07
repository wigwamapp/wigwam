import { FC } from "react";
import { useSetAtom } from "jotai";
import BigNumber from "bignumber.js";
import classNames from "clsx";

import type { RampTokenInfo } from "core/types";
import { NATIVE_TOKEN_SLUG, parseTokenSlug } from "core/common";
import { useRamp } from "app/hooks";
import { onRampModalAtom, tokenSlugAtom } from "app/atoms";
import Button from "app/components/elements/Button";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import NetworksList from "app/components/blocks/NetworksList";
import PriceArrow from "app/components/elements/PriceArrow";
import { ReactComponent as NoCoinsIcon } from "app/icons/nocoins.svg";

const Buy: FC = () => {
  const { onRampTokensInChain } = useRamp();
  const setOnRampModalOpened = useSetAtom(onRampModalAtom);
  const setTokenSlug = useSetAtom(tokenSlugAtom);

  const handleOpenRampModal = (currency: RampTokenInfo) => {
    setTokenSlug([currency.slug]);
    setOnRampModalOpened([true]);
  };

  function formatNumber(value: any) {
    if (value) {
      if (value <= 0.000001) {
        return value.toFixed(9);
      } else {
        return value.toString();
      }
    } else {
      return "0";
    }
  }

  const getTokenPrice = (token: RampTokenInfo) => {
    return {
      price: formatNumber(token?.priceUsd),
      priceUSDChange: token?.priceUsdChange ?? 0,
    };
  };

  const nativeToken = onRampTokensInChain.find(
    (item) => item.slug === NATIVE_TOKEN_SLUG,
  );
  return (
    <>
      <NetworksList />

      <div className="flex min-h-0 grow flex-col">
        <ScrollAreaContainer
          className="w-full min-w-[17.75rem]"
          viewPortClassName="pb-5 pt-8 pr-5"
          scrollBarClassName="py-0 pt-5 pb-5"
        >
          <div>
            {onRampTokensInChain.length > 0 && nativeToken && (
              <>
                <h1 className="mb-7 text-2xl font-bold">Buy tokens</h1>
                <h2 className="font-bold text-[#F8F9FD] mb-2 text-lg">
                  Network Token
                </h2>
                <div
                  className="flex items-center justify-between max-w-[480px] mb-3 w-full rounded-xl pt-3 pb-3 pr-4 pl-4"
                  style={{ backgroundColor: "#21262A" }}
                >
                  <div className="flex items-center justify-center">
                    <img
                      className="w-8 h-8 mr-3"
                      src={nativeToken.image}
                      alt={nativeToken.symbol}
                    />
                    <div className="text-base font-bold text-brand-white">
                      {nativeToken.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="mr-1 text-left text-sm transition-colors text-brand-inactivedark whitespace-nowrap">
                      {getTokenPrice(nativeToken)?.price} $
                    </div>
                    {getTokenPrice(nativeToken)?.priceUSDChange &&
                      +getTokenPrice(nativeToken)?.priceUSDChange !== 0 && (
                        <span
                          className={classNames(
                            "inline-flex items-center",
                            "group-hover:opacity-100",
                            "transition",
                            "ml-2",
                            getTokenPrice(nativeToken)?.priceUSDChange &&
                              +getTokenPrice(nativeToken)?.priceUSDChange > 0
                              ? "text-[#6BB77A]"
                              : "text-[#EA556A]",
                          )}
                        >
                          <PriceArrow
                            className={classNames(
                              "w-2 h-2 mr-[0.125rem]",
                              +getTokenPrice(nativeToken)?.priceUSDChange < 0 &&
                                "transform rotate-180",
                            )}
                          />

                          <span className="text-xs leading-4">
                            {new BigNumber(
                              getTokenPrice(nativeToken)?.priceUSDChange,
                            )
                              .abs()
                              .toFixed(2)}
                            %
                          </span>
                        </span>
                      )}
                    <Button
                      className="ml-3 !max-w-[78px] !min-w-[78px]"
                      style={{ background: "#2E3439", color: "#fff" }}
                      onClick={() => handleOpenRampModal(nativeToken)}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          {onRampTokensInChain.length > 1 && (
            <h2 className="font-bold text-[#F8F9FD] mb-3 mt-8 text-lg">
              Other Tokens
            </h2>
          )}

          {onRampTokensInChain.length > 0 &&
            onRampTokensInChain.map((item: RampTokenInfo) => {
              const itemAddress = parseTokenSlug(item.slug).address;

              if (itemAddress && item.slug !== NATIVE_TOKEN_SLUG) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between max-w-[480px] mb-3 w-full rounded-md pt-3 pb-3 pr-4 pl-4"
                    style={{ backgroundColor: "#21262A" }}
                  >
                    <div className="flex items-center justify-center">
                      <img
                        className="w-8 h-8 mr-3"
                        src={item.image}
                        alt={item.symbol}
                      />
                      <div className="text-base font-bold text-brand-white">
                        {item.name}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="mr-1 text-left text-sm transition-colors text-brand-inactivedark whitespace-nowrap">
                        {getTokenPrice(item)?.price} $
                      </div>
                      {getTokenPrice(item)?.priceUSDChange &&
                        +getTokenPrice(item)?.priceUSDChange !== 0 && (
                          <span
                            className={classNames(
                              "inline-flex items-center",
                              "group-hover:opacity-100",
                              "transition",
                              "ml-2",
                              getTokenPrice(item)?.priceUSDChange &&
                                +getTokenPrice(item)?.priceUSDChange > 0
                                ? "text-[#6BB77A]"
                                : "text-[#EA556A]",
                            )}
                          >
                            <PriceArrow
                              className={classNames(
                                "w-2 h-2 mr-[0.125rem]",
                                +getTokenPrice(item)?.priceUSDChange < 0 &&
                                  "transform rotate-180",
                              )}
                            />

                            <span className="text-xs leading-4">
                              {new BigNumber(
                                getTokenPrice(item)?.priceUSDChange,
                              )
                                .abs()
                                .toFixed(2)}
                              %
                            </span>
                          </span>
                        )}
                      <Button
                        className="ml-3 !max-w-[78px] !min-w-[78px]"
                        style={{ background: "#2E3439", color: "#fff" }}
                        onClick={() => handleOpenRampModal(item)}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                );
              }
            })}

          {onRampTokensInChain.length === 0 && (
            <div className="mt-12 w-full mx-auto max-w-[24rem] flex flex-col items-center justify-center">
              <NoCoinsIcon className="w-[3rem] h-auto mb-3" />

              <h3 className="text-[#4B505C] font-medium text-base text-center">
                Currently, there are no tokens available for purchase on the
                selected network.
              </h3>
            </div>
          )}
        </ScrollAreaContainer>
      </div>
    </>
  );
};

export default Buy;
