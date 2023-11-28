import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { LiFi } from "@lifi/sdk";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";
import { useAccounts } from "app/hooks";

import axios from "axios";

import { useAtom } from "jotai";
import classNames from "clsx";
import { Link } from "lib/navigation";

import { AccountAsset, AccountToken, TokenType } from "core/types";

import { LOAD_MORE_ON_TOKEN_FROM_END } from "app/defaults";
import { tokenSlugAtom, tokenSlugOutputAtom } from "app/atoms";
import { useAccountToken, useAllAccountTokens } from "app/hooks/tokens";
import { Page } from "app/nav";
import { ReactComponent as SelectedIcon } from "app/icons/SelectCheck.svg";

import Select from "app/components/elements/Select";
import PrettyAmount from "app/components/elements/PrettyAmount";
import FiatAmount from "app/components/elements/FiatAmount";
import AssetLogo from "app/components/elements/AssetLogo";

// import FiatAmount from "./FiatAmount";
// import AssetLogo from "./AssetLogo";
// import PrettyAmount from "./PrettyAmount";
// import NftAvatar from "./NftAvatar";
// import TokenSelect from "app/components/elements/TokenSelect";

const Swap: FC = () => {
  const [opened, setOpened] = useState(false);
  const [openedOutput, setOpenedOutput] = useState(false);

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [outputSearchValue, setOutputSearchValue] = useState<string | null>(
    null,
  );

  const [outputTokensList, setOutputTokensList] = useState<
    AccountAsset[] | null
  >();
  const [filteredOutputTokensList, setFilteredOutputTokensList] = useState<
    any | null
  >();

  useEffect(() => {
    if (!outputTokensList) return;
    console.log(outputSearchValue);
    if (outputSearchValue) {
      const normalizedQuery = outputSearchValue.toLowerCase();
      const filtered = outputTokensList
        .filter(
          (token) =>
            token.name.toLowerCase().includes(normalizedQuery) ||
            token.symbol.toLowerCase().includes(normalizedQuery) ||
            token.tokenSlug.toLowerCase().includes(normalizedQuery),
        )
        .map((token) => prepareToken(token as AccountAsset, "small", false));

      setFilteredOutputTokensList(filtered);
    } else {
      setFilteredOutputTokensList(
        outputTokensList.map((token) =>
          prepareToken(token as AccountAsset, "small", false),
        ),
      );
    }
  }, [outputSearchValue, outputTokensList?.length]);

  const tokenType = TokenType.Asset;

  const { currentAccount } = useAccounts();

  // const lifi = new LiFi({
  //   integrator: "Wigwam",
  // });

  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);

  const [tokenSlugOutput, setTokenSlugOutput] = useAtom(tokenSlugOutputAtom);

  const currentToken = useAccountToken(tokenSlug ?? NATIVE_TOKEN_SLUG);
  const [currentTokenOutput, setCurrentTokenOutput] =
    useState<AccountAsset | null>(null);

  useEffect(() => {
    if (tokenSlugOutput && outputTokensList) {
      const neededToken = outputTokensList.find(
        (item: AccountAsset) => item.tokenSlug === tokenSlugOutput,
      );
      console.log(neededToken);
      if (neededToken) {
        setCurrentTokenOutput(neededToken);
      }
    }
  }, [tokenSlugOutput]);

  // let currentTokenOutput = useAccountToken(tokenSlugOutput ?? NATIVE_TOKEN_SLUG);

  const getTokens = async () => {
    // const optionalFilter = [56] // Both numeric and mnemonic can be used
    /// chainTypes can be of type SVM and EVM. By default, only EVM tokens will be returned
    const optionalChainTypes = "EVM";
    const {
      data: { tokens: outputTokens },
    } = await axios.get("https://li.quest/v1/tokens", {
      params: {
        // chains: optionalFilter.join(','),
        chainTypes: optionalChainTypes,
      },
    });

    for (const key in outputTokens) {
      if (outputTokens.hasOwnProperty(key)) {
        const array = outputTokens[key];

        const filteredArray = array.filter(
          (item: any) => item.priceUSD !== "0",
        );

        const formatedTokens = filteredArray.map((item: any) => {
          return {
            chainId: item.chainId,
            accountAddress: currentAccount.address,
            tokenType: TokenType.Asset,
            status: 2,
            tokenSlug: `ERC20_${item.address}_0`,
            decimals: item.decimals,
            name: item.name,
            symbol: item.symbol,
            logoUrl: item.logoURI,
            rawBalance: 0,
            balanceUSD: 0,
            portfolioUSD: 0,
          };
        });

        outputTokens[key] = formatedTokens;
      }
    }

    setOutputTokensList(outputTokens[56]);
  };

  const { tokens, loadMore, hasMore } = useAllAccountTokens(
    tokenType,
    currentAccount.address,
    {
      search: searchValue ?? undefined,
    },
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

  // const preparedOutputTokens = useMemo(
  //   () =>
  //     outputTokensList &&
  //     outputTokensList.map((token) =>
  //       prepareToken(token as AccountAsset, "small", false),
  //     ),
  //   [tokenSlug, outputTokensList],
  // );

  useEffect(() => {
    getTokens();
  }, []);

  // useEffect(() => {
  //   console.log(preparedTokens)
  //   console.log(preparedOutputTokens)
  // }, [preparedOutputTokens, preparedTokens])

  const preparedCurrentToken = useMemo(
    () =>
      currentToken
        ? prepareToken(currentToken as AccountAsset, "large")
        : undefined,
    [currentToken],
  );

  let preparedCurrentTokenOutput = useMemo(() => {
    if (outputTokensList) {
      return currentTokenOutput
        ? prepareToken(currentTokenOutput as AccountAsset, "large")
        : prepareToken(outputTokensList[0] as AccountAsset, "large");
    } else {
      return undefined;
    }
  }, [currentTokenOutput, outputTokensList]);

  useEffect(() => {
    if (currentTokenOutput) {
      console.log(currentTokenOutput);
      preparedCurrentTokenOutput = prepareToken(
        currentTokenOutput as AccountAsset,
        "large",
      );
    }
  }, [currentTokenOutput]);

  useEffect(() => {
    if (outputTokensList) {
      preparedCurrentTokenOutput = prepareToken(
        outputTokensList[0] as AccountAsset,
        "large",
      );
    }
  }, [outputTokensList]);

  // useEffect(() => {
  //   preparedCurrentTokenOutput = useMemo(
  //     () =>
  //     outputTokensList.length
  //         ? prepareToken(outputTokensList[0] as AccountAsset, "large")
  //         : undefined,
  //     [outputTokensList],
  //   );
  // }, [outputTokensList.length])

  const onTokenSelect = useCallback(
    (tSlug: string) => {
      setTokenSlug([tSlug, "replace"]);
    },
    [setTokenSlug],
  );

  const onTokenSelectOutput = useCallback(
    (tSlug: string) => {
      setTokenSlugOutput([tSlug, "replace"]);
    },
    [setTokenSlugOutput],
  );

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

  return (
    <div>
      <div className="max-w-[5rem]">
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
      </div>
      <div className="max-w-[5rem]">
        {filteredOutputTokensList && (
          <Select
            open={openedOutput}
            onOpenChange={setOpenedOutput}
            items={filteredOutputTokensList}
            currentItem={preparedCurrentTokenOutput}
            setItem={(asset) => onTokenSelectOutput(asset.key)}
            searchValue={outputSearchValue}
            onSearch={setOutputSearchValue}
            label="Token Output"
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
        )}
      </div>
      <div>{JSON.stringify(currentToken)}</div>
    </div>
  );
};

export default Swap;

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
      <></>
    ),
});
