import { memo, useCallback } from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";

import { TokenType } from "core/types";
import { useToken } from "app/hooks";
import { prepareNFTLabel } from "app/utils";
import { LARGE_AMOUNT } from "app/utils/largeAmount";

import { ReactComponent as XSymbolIcon } from "app/icons/xsymbol.svg";

import PrettyAmount from "../elements/PrettyAmount";
import FiatAmount from "../elements/FiatAmount";
import AssetLogo from "../elements/AssetLogo";
import NftAvatar from "../elements/NftAvatar";
import Dot from "../elements/Dot";

type TokenAmountProps = {
  accountAddress: string;
  token: {
    slug: string;
    amount?: string;
  };
  rawAmount?: boolean;
  isSmall?: boolean;
  className?: string;
};

const TokenAmount = memo<TokenAmountProps>(
  ({
    accountAddress,
    token: { slug, amount },
    rawAmount = false,
    isSmall = false,
    className,
  }) => {
    const tokenInfo = useToken(accountAddress, slug);

    const getUSDEquivalent = useCallback(
      (
        isRaw: boolean,
        decimals: number,
        amountCrypto?: string,
        priceUSD?: string,
      ) => {
        if (amountCrypto) {
          if (isRaw) {
            if (priceUSD) {
              return new BigNumber(amountCrypto).times(priceUSD);
            }
          } else {
            return new BigNumber(amountCrypto)
              .div(new BigNumber(10).pow(decimals))
              .multipliedBy(priceUSD ?? 0);
          }
        }
        return null;
      },
      [],
    );

    if (!tokenInfo) return null;

    if (tokenInfo.tokenType === TokenType.Asset) {
      const { name, symbol, decimals, priceUSD } = tokenInfo;

      const equivalentInUSD = getUSDEquivalent(
        rawAmount,
        decimals,
        amount,
        priceUSD,
      );

      return (
        <div className={classNames("flex items-center", className)}>
          <AssetLogo
            asset={tokenInfo}
            alt={name}
            className="w-4 h-4 min-w-[1rem]"
          />
          {amount !== undefined &&
          new BigNumber(amount).lt(
            new BigNumber(10).pow(new BigNumber(decimals).plus(12)),
          ) ? (
            <>
              <PrettyAmount
                amount={amount}
                decimals={!rawAmount ? decimals : undefined}
                currency={symbol}
                threeDots={false}
                copiable
                className={classNames(
                  isSmall ? "text-xs ml-1.5" : "text-sm ml-2",
                  "font-bold",
                )}
              />
              {equivalentInUSD !== null && (
                <>
                  <Dot isSmall={isSmall} />
                  <FiatAmount
                    amount={equivalentInUSD}
                    threeDots={false}
                    copiable
                    className={classNames(
                      isSmall ? "text-xs" : "text-sm",
                      "text-brand-inactivedark",
                    )}
                  />
                </>
              )}
            </>
          ) : (
            <span
              className={classNames(
                isSmall ? "text-xs" : "text-sm",
                "font-bold ml-2",
              )}
            >
              {amount !== undefined &&
                new BigNumber(amount).gte(LARGE_AMOUNT) && (
                  <>
                    <span className="text-[#D99E2E]">[ infinity ]</span>{" "}
                  </>
                )}
              {symbol}
            </span>
          )}
        </div>
      );
    } else {
      const { name: originName, tokenId: originId, thumbnailUrl } = tokenInfo;
      const { name, id } = prepareNFTLabel(originId, originName);
      const isAmountLargerOne = amount && +amount > 1;
      const isId = id !== undefined;

      return (
        <div className={classNames("flex items-center justify-end", className)}>
          <div className="flex flex-col items-end justify-around text-brand-light min-w-0">
            <div
              className={classNames(
                isSmall ? "text-xs" : "text-sm",
                "min-w-0 w-full text-right",
                !name && isId ? "text-brand-main" : "",
                !(name && isId) ? "line-clamp-2" : "truncate",
              )}
            >
              {name ? name : ""}
              {name && isId ? " " : ""}
              {isId && !name ? (
                <span className="text-brand-main">{id}</span>
              ) : (
                ""
              )}
            </div>

            {name && isId ? (
              <div
                className={classNames(
                  isSmall ? "text-xs" : "text-sm",
                  "text-brand-main font-bold min-w-0 w-full truncate text-right",
                )}
              >
                {id}
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={classNames(
              isSmall ? "ml-1.5" : "ml-2",
              isSmall ? "w-8 h-8 min-w-[2rem]" : "w-11 h-11 min-w-[2.75rem]",
              "relative group",
            )}
          >
            <NftAvatar
              src={thumbnailUrl}
              alt={name}
              className={classNames(
                "w-full h-full",
                isSmall ? "!rounded" : "!rounded-md",
                isAmountLargerOne &&
                  "opacity-20 transition-opacity group-hover:opacity-100",
              )}
              errorClassName={isSmall ? "h-[2rem]" : "h-[2.75rem]"}
            />
            {isAmountLargerOne ? (
              <div
                className={classNames(
                  "flex justify-center items-center",
                  "text-xs font-bold",
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  "transition-opacity group-hover:opacity-0",
                  "min-w-0 w-full",
                )}
              >
                <XSymbolIcon className="w-2 min-w-[.5rem] h-auto mr-0.5" />
                <PrettyAmount
                  amount={amount}
                  isMinified
                  isThousandsMinified={false}
                  decimals={0}
                  threeDots={false}
                  className="min-w-0 truncate"
                />
              </div>
            ) : null}
          </div>
        </div>
      );
    }
  },
);

export default TokenAmount;
