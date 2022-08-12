import { memo } from "react";
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
  className?: string;
};

const TokenAmount = memo<TokenAmountProps>(
  ({ accountAddress, token: { slug, amount }, className }) => {
    const tokenInfo = useToken(accountAddress, slug);

    if (!tokenInfo) return null;

    if (tokenInfo.tokenType === TokenType.Asset) {
      const { name, symbol, decimals, priceUSD } = tokenInfo;

      const usdAmount = amount
        ? new BigNumber(amount)
            .div(new BigNumber(10).pow(decimals))
            .multipliedBy(priceUSD ?? 0)
        : null;

      return (
        <div className={classNames("flex items-center", className)}>
          <AssetLogo
            asset={tokenInfo}
            alt={name}
            className="w-4 h-4 min-w-[1rem]"
          />
          {amount !== undefined &&
          new BigNumber(amount).lt(new BigNumber(10).pow(decimals + 12)) ? (
            <>
              <PrettyAmount
                amount={amount}
                decimals={decimals}
                currency={symbol}
                threeDots={false}
                copiable
                className="text-sm font-bold ml-2"
              />
              {usdAmount !== undefined && (
                <>
                  <Dot />
                  <FiatAmount
                    amount={usdAmount}
                    threeDots={false}
                    copiable
                    className="text-sm text-brand-inactivedark"
                  />
                </>
              )}
            </>
          ) : (
            <span className="text-sm font-bold ml-2">
              {amount !== undefined && new BigNumber(amount).gte(LARGE_AMOUNT) && (
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

      return (
        <div className={classNames("flex items-center justify-end", className)}>
          <div className="flex flex-col items-end justify-around text-brand-light min-w-0">
            {isAmountLargerOne ? (
              <div className="flex items-center text-sm font-bold">
                <PrettyAmount
                  amount={amount}
                  isMinified
                  isThousandsMinified={false}
                  decimals={0}
                  threeDots={false}
                  className="mr-1"
                />

                <XSymbolIcon />
              </div>
            ) : name && id ? (
              <div className="text-sm text-brand-main font-bold min-w-0 w-full truncate text-right">
                {id}
              </div>
            ) : (
              ""
            )}

            <div
              className={classNames(
                "text-sm min-w-0 w-full truncate text-right",
                !name ? "text-brand-main" : ""
              )}
            >
              {name}
              {name && id && isAmountLargerOne ? " " : ""}
              {id && (isAmountLargerOne || !name) ? (
                <span className="text-brand-main">{id}</span>
              ) : (
                ""
              )}
            </div>
          </div>

          <NftAvatar
            src={thumbnailUrl}
            alt={name}
            className="ml-2 w-10 h-10 min-w-[2.5rem] !rounded-md"
            errorClassName="h-[6rem]"
          />
        </div>
      );
    }
  }
);

export default TokenAmount;
