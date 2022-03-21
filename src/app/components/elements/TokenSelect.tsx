import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import classNames from "clsx";

import { AccountAsset, TokenType } from "core/types";

import { LOAD_MORE_ON_ASSET_FROM_END } from "app/defaults";
import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import { useAccountTokens, useToken } from "app/hooks/tokens";

import Select from "./Select";
import Avatar from "./Avatar";
import PrettyAmount from "./PrettyAmount";

const TokenSelect: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const { tokens, loadMore, hasMore } = useAccountTokens(
    TokenType.Asset,
    currentAccount.address,
    {
      search: searchValue ?? undefined,
    }
  );

  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);

  const currentToken = useToken(tokenSlug);

  const setDefaultTokenRef = useRef(!tokenSlug);

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerAssetRef = useCallback(
    (node) => {
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
    [hasMore, loadMore, tokens]
  );

  useEffect(() => {
    if (setDefaultTokenRef.current && tokens.length > 0) {
      setTokenSlug([tokens[0].tokenSlug, "replace"]);
      setDefaultTokenRef.current = false;
    }
  }, [setTokenSlug, tokens]);

  const onTokenSelect = useCallback(
    (tSlug: string) => {
      setTokenSlug([tSlug, "replace"]);
    },
    [setTokenSlug]
  );

  const preparedTokens = useMemo(
    () => tokens.map((token) => prepareToken(token as AccountAsset)),
    [tokens]
  );

  const preparedCurrentToken = useMemo(
    () =>
      currentToken ? prepareToken(currentToken as AccountAsset, "large") : null,
    [currentToken]
  );

  return preparedCurrentToken ? (
    <Select
      items={preparedTokens}
      currentItem={preparedCurrentToken}
      setItem={(asset) => onTokenSelect(asset.key)}
      searchValue={searchValue}
      onSearch={setSearchValue}
      label="Token"
      itemRef={loadMoreTriggerAssetRef}
      loadMoreOnItemFromEnd={LOAD_MORE_ON_ASSET_FROM_END}
      currentItemClassName={classNames("!p-3")}
      contentClassName="w-[23.25rem] flex flex-col"
    />
  ) : (
    <></>
  );
};

export default TokenSelect;

const Token: FC<{ asset: AccountAsset; size?: "small" | "large" }> = ({
  asset,
  size = "small",
}) => {
  const { logoUrl, name, symbol, rawBalance, decimals, balanceUSD } = asset;

  return (
    <span
      className={classNames(
        "flex grow",
        "min-w-0",
        size === "large" && "mr-3",
        size === "small" && "items-center"
      )}
    >
      <Avatar
        src={logoUrl}
        className={classNames(
          size === "large" && "w-10 h-10 min-w-[2.5rem] mr-3",
          size === "small" && "w-8 h-8 min-w-[2rem] mr-3"
        )}
      />
      <span className="flex flex-col justify-between text-left grow min-w-0">
        <span className="flex justify-between">
          <span className="truncate">{symbol}</span>
          <PrettyAmount
            amount={rawBalance ?? 0}
            decimals={decimals}
            currency={symbol}
            className="ml-2"
          />
        </span>
        <span className="flex justify-between">
          <span className="text-xs text-brand-inactivedark font-normal truncate">
            {name}
          </span>
          <PrettyAmount
            amount={balanceUSD ?? 0}
            currency="$"
            className="text-xs font-normal ml-1"
          />
        </span>
      </span>
    </span>
  );
};

const prepareToken = (
  asset: AccountAsset,
  size: "large" | "small" = "small"
) => ({
  key: asset.tokenSlug,
  value: <Token asset={asset} size={size} />,
});
