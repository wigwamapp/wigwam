import { FC } from "react";
import { useAtom } from "jotai";
import BigNumber from "bignumber.js";
import classNames from "clsx";

import { useLazyAtomValue } from "lib/atom-utils";
import { useRamp, RampCurrency } from "app/hooks";
import { onRampModalAtom, onRampSelectedCurrencyAtom } from "app/atoms";
import Button from "app/components/elements/Button";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { getTransakTokenPriceAtom } from "app/atoms";
import PriceArrow from "app/components/elements/PriceArrow";
import { useChainId } from "app/hooks";

const BuyWithFiat: FC = () => {
  const { onRampTokensInChain } = useRamp();
  const [, setOnRampModalOpened] = useAtom(onRampModalAtom);
  const [, setOnRampSelectedCurrency] = useAtom(onRampSelectedCurrencyAtom);
  const chainId = useChainId();

  const handleOpenRampModal = (currency: RampCurrency) => {
    setOnRampSelectedCurrency([currency]);
    setOnRampModalOpened([true]);
  };

  console.log(onRampTokensInChain);

  const response = useLazyAtomValue(
    getTransakTokenPriceAtom({
      tokenAddresses: onRampTokensInChain
        .map((item) => item.address)
        .filter((item) => item),
      chainId: Number(chainId),
    }),
  );

  console.log(response);

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

  const getTokenPrice = (address: string) => {
    return {
      price: formatNumber(response?.prices[address]?.usd),
      priceUSDChange: response?.prices[address]?.usd_24h_change,
    };
  };

  const getNativeTokenPrice = () => {
    return {
      price: formatNumber(response?.prices.nativeToken?.usd),
      priceUSDChange: response?.prices.nativeToken?.usd_24h_change,
    };
  };

  const nativeToken = onRampTokensInChain.find((item) => !item.address);

  return (
    <ScrollAreaContainer
      className="w-full min-w-[17.75rem]"
      viewPortClassName="pb-5 pt-5 pr-5 pl-6"
      scrollBarClassName="py-0 pt-5 pb-5"
    >
      <div>
        {onRampTokensInChain.length > 0 && nativeToken && (
          <>
            <h2 className="font-bold text-[#F8F9FD] mb-3 text-lg">
              Network Token
            </h2>
            <div
              className="flex items-center justify-between max-w-[480px] mb-3 w-full rounded-md pt-3 pb-3 pr-4 pl-4"
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
                  {getNativeTokenPrice()?.price} $
                </div>
                {getNativeTokenPrice()?.priceUSDChange &&
                  +getNativeTokenPrice()?.priceUSDChange !== 0 && (
                    <span
                      className={classNames(
                        "inline-flex items-center",
                        "group-hover:opacity-100",
                        "transition",
                        "ml-2",
                        getNativeTokenPrice()?.priceUSDChange &&
                          +getNativeTokenPrice()?.priceUSDChange > 0
                          ? "text-[#6BB77A]"
                          : "text-[#EA556A]",
                      )}
                    >
                      <PriceArrow
                        className={classNames(
                          "w-2 h-2 mr-[0.125rem]",
                          +getNativeTokenPrice()?.priceUSDChange < 0 &&
                            "transform rotate-180",
                        )}
                      />

                      <span className="text-xs leading-4">
                        {new BigNumber(getNativeTokenPrice()?.priceUSDChange)
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
      {onRampTokensInChain.length > 0 && (
        <h2 className="font-bold text-[#F8F9FD] mb-3 mt-8 text-lg">
          Other Tokens
        </h2>
      )}

      {onRampTokensInChain.length > 0 &&
        onRampTokensInChain.map((item: RampCurrency) => {
          if (item.address) {
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
                    {getTokenPrice(item.address)?.price} $
                  </div>
                  {getTokenPrice(item.address)?.priceUSDChange &&
                    +getTokenPrice(item.address)?.priceUSDChange !== 0 && (
                      <span
                        className={classNames(
                          "inline-flex items-center",
                          "group-hover:opacity-100",
                          "transition",
                          "ml-2",
                          getTokenPrice(item.address)?.priceUSDChange &&
                            +getTokenPrice(item.address)?.priceUSDChange > 0
                            ? "text-[#6BB77A]"
                            : "text-[#EA556A]",
                        )}
                      >
                        <PriceArrow
                          className={classNames(
                            "w-2 h-2 mr-[0.125rem]",
                            +getTokenPrice(item.address)?.priceUSDChange < 0 &&
                              "transform rotate-180",
                          )}
                        />

                        <span className="text-xs leading-4">
                          {new BigNumber(
                            getTokenPrice(item.address)?.priceUSDChange,
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
    </ScrollAreaContainer>
  );
};

export default BuyWithFiat;
