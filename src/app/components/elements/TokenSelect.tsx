import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import classNames from "clsx";
import { usePrevious } from "lib/react-hooks/usePrevious";
import { Link } from "lib/navigation";

import { AccountAsset, AccountNFT, AccountToken, TokenType } from "core/types";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import { LOAD_MORE_ON_TOKEN_FROM_END } from "app/defaults";
import { tokenSlugAtom } from "app/atoms";
import { useAccounts } from "app/hooks";
import { useAccountToken, useAllAccountTokens } from "app/hooks/tokens";
import { prepareNFTLabel } from "app/utils";
import { Page } from "app/nav";
import { ReactComponent as SelectedIcon } from "app/icons/SelectCheck.svg";
import { ReactComponent as XSymbolIcon } from "app/icons/xsymbol.svg";
import { ReactComponent as MediaFallbackIcon } from "app/icons/media-fallback.svg";

import Delay from "../blocks/misc/Delay";

import Select from "./Select";
import FiatAmount from "./FiatAmount";
import AssetLogo from "./AssetLogo";
import PrettyAmount from "./PrettyAmount";
import NftAvatar from "./NftAvatar";

type TokenSelectProps = {
  tokenType: TokenType;
  handleTokenChanged?: () => void;
};

const TokenSelect: FC<TokenSelectProps> = ({
  tokenType,
  handleTokenChanged,
}) => {
  const { currentAccount } = useAccounts();
  const [opened, setOpened] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const { tokens, loadMore, hasMore } = useAllAccountTokens(
    tokenType,
    currentAccount.address,
    {
      search: searchValue ?? undefined,
    },
  );

  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);

  let currentToken = useAccountToken(tokenSlug ?? NATIVE_TOKEN_SLUG);

  if (currentToken && currentToken.tokenType !== tokenType) {
    currentToken = undefined;
  }

  const setDefaultTokenRef = useRef(!tokenSlug);

  useEffect(() => {
    setDefaultTokenRef.current = !tokenSlug;
  }, [tokenSlug, currentAccount.address]);

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

  useEffect(() => {
    if (setDefaultTokenRef.current && tokens.length > 0) {
      setTimeout(() => setTokenSlug([tokens[0].tokenSlug, "replace"]));
      setDefaultTokenRef.current = false;
    }
  }, [setTokenSlug, tokens]);

  const onTokenSelect = useCallback(
    (tSlug: string) => {
      setTokenSlug([tSlug, "replace"]);
    },
    [setTokenSlug],
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

  const preparedCurrentToken = useMemo(
    () =>
      currentToken
        ? prepareToken(currentToken as AccountAsset, "large")
        : undefined,
    [currentToken],
  );

  const prevTokenSlug = usePrevious(currentToken?.tokenSlug);

  useEffect(() => {
    if (prevTokenSlug && currentToken?.tokenSlug !== prevTokenSlug) {
      handleTokenChanged?.();
    }
  }, [currentToken, prevTokenSlug, handleTokenChanged]);

  if (tokenType === TokenType.NFT && tokens.length === 0) {
    return (
      <div className="flex flex-col">
        <div
          className={classNames(
            "ml-4 mb-2",
            "text-base font-normal text-left",
            "text-brand-gray",
            "flex items-center",
          )}
        >
          Token
        </div>
        <div
          className={classNames(
            "h-[6.125rem]",
            "p-3",
            "bg-brand-main/5 rounded-[.625rem]",
            "flex items-center",
            "text-sm text-brand-inactivelight",
          )}
        >
          <Delay ms={300}>
            <>
              <div
                className={classNames(
                  "w-[4.625rem] h-[4.625rem] min-w-[4.625rem]",
                  "bg-brand-main/5 rounded-[.625rem]",
                  "flex items-center justify-center",
                  "mr-3",
                  "animate-bootfadein",
                )}
              >
                <MediaFallbackIcon className="w-full h-auto" />
              </div>
              <span className="animate-bootfadein">
                There are no NFTs on this wallet
              </span>
            </>
          </Delay>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default TokenSelect;

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

const NFTItem: FC<{
  token: AccountNFT;
  isSelected?: boolean;
  size?: "small" | "large";
}> = ({ token, isSelected = false, size = "small" }) => {
  const {
    name: originName,
    tokenId: originId,
    thumbnailUrl,
    rawBalance,
  } = token;
  const { name, id } = prepareNFTLabel(originId, originName);

  const isAmountLargerOne = rawBalance && +rawBalance > 1;
  const isId = id !== undefined;

  return (
    <span
      className={classNames("flex grow", "min-w-0", size === "large" && "mr-3")}
    >
      <span className="flex relative mr-3">
        <NftAvatar
          src={thumbnailUrl}
          alt={name}
          className={classNames(
            "w-[4.625rem] h-[4.625rem] min-w-[4.625rem]",
            "!rounded-[.625rem]",
            isSelected && "opacity-20",
          )}
        />

        {isSelected && (
          <span
            className={classNames(
              "absolute inset-0",
              "rounded-[.625rem]",
              "border border-brand-light",
              "flex items-center justify-center",
            )}
          >
            <SelectedIcon className="w-10 h-auto fill-brand-light" />
          </span>
        )}
      </span>
      <span className="flex flex-col justify-between text-left grow min-w-0">
        <span
          className={classNames(
            "text-xl leading-[1.375rem]",
            isAmountLargerOne ? "line-clamp-2" : "flex flex-col",
            "break-words",
            !name ? "text-brand-main" : "",
          )}
        >
          {name && (
            <span
              className={classNames(
                name.length > 23 &&
                  !name.slice(0, 23).includes(" ") &&
                  "break-all",
                !isAmountLargerOne && "line-clamp-2",
              )}
            >
              {name}
            </span>
          )}
          {name && isId ? " " : ""}
          {isId ? (
            <span
              className={classNames(
                "text-brand-main",
                id.length > 23 ? "break-all" : "break-words",
                !isAmountLargerOne && "truncate",
              )}
            >
              {id}
            </span>
          ) : (
            ""
          )}
        </span>
        {isAmountLargerOne && (
          <PrettyAmount
            prefix={<XSymbolIcon className="w-2.5 h-auto mt-px mr-0.5" />}
            amount={rawBalance ?? 0}
            isMinified
            isThousandsMinified={false}
            decimals={0}
            threeDots={false}
            asSpan
            className="py-0.5 px-2.5 bg-brand-main/20 rounded mr-auto flex items-center"
          />
        )}
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
      <NFTItem token={token} size={size} isSelected={isSelected} />
    ),
});
