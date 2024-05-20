import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ethers } from "ethers";
import { storage } from "lib/ext/storage";

import { TokenStandard, TokenType } from "core/types";
import {
  createTokenSlug,
  detectNFTStandard,
  isTokenStandardValid,
} from "core/common/tokens";
import { findToken } from "core/client";

import {
  useChainId,
  useIsSyncing,
  useAllAccountTokens,
  useProvider,
  useAccounts,
} from "app/hooks";

export function useTokenList(
  tokenType: TokenType,
  opts: {
    onAccountTokensReset?: () => void;
    searchPersist?: boolean;
  } = {},
) {
  const chainId = useChainId();
  const provider = useProvider();
  const { currentAccount } = useAccounts();

  const isNftsSelected = tokenType === TokenType.NFT;

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [tokenIdSearchValue, setTokenIdSearchValue] = useState<string | null>(
    null,
  );
  const [manageModeEnabled, setManageModeEnabled] = useState(false);

  useTokenSearchPersist(
    opts.searchPersist ?? false,
    searchValue,
    setSearchValue,
  );

  const combinedSearchValue = useMemo(() => {
    if (!searchValue) return undefined;
    if (!tokenIdSearchValue) return searchValue;

    return `${searchValue}:${tokenIdSearchValue}`;
  }, [searchValue, tokenIdSearchValue]);

  const searchValueIsAddress = useMemo(
    () => searchValue && ethers.isAddress(searchValue),
    [searchValue],
  );

  const { tokens, loadMore, hasMore } = useAllAccountTokens(
    tokenType,
    currentAccount.address,
    {
      withDisabled:
        manageModeEnabled || Boolean(isNftsSelected && combinedSearchValue),
      search: combinedSearchValue,
      onReset: opts.onAccountTokensReset,
    },
  );

  const observer = useRef<IntersectionObserver>();
  const loadMoreTriggerRef = useCallback(
    (node: HTMLButtonElement) => {
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

  const searchInputRef = useRef<HTMLInputElement>(null);
  const tokenIdSearchInputRef = useRef<HTMLInputElement>(null);

  const focusSearchInput = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.select();
    }
  }, []);

  const syncing = useIsSyncing();

  const tokenIdSearchDisplayed = Boolean(
    isNftsSelected && searchValueIsAddress,
  );
  const willSearch = Boolean(
    searchValueIsAddress &&
      tokens.length === 0 &&
      (tokenIdSearchDisplayed ? tokenIdSearchValue : true),
  );

  useEffect(() => {
    if (!tokenIdSearchDisplayed) {
      setTokenIdSearchValue(null);
    }
  }, [tokenIdSearchDisplayed, setTokenIdSearchValue]);

  useEffect(() => {
    if (willSearch) {
      const t = setTimeout(async () => {
        const tokenAddress = ethers.getAddress(searchValue!);

        let tokenSlug: string;

        if (isNftsSelected) {
          if (!tokenIdSearchValue) return;

          try {
            const tokenId = BigInt(tokenIdSearchValue).toString();

            const tokenStandard = await detectNFTStandard(
              provider,
              tokenAddress,
              tokenId,
            );

            const validStandard = await isTokenStandardValid(
              provider,
              tokenAddress,
              tokenStandard,
            );
            if (!validStandard) return;

            tokenSlug = createTokenSlug({
              standard: tokenStandard,
              address: tokenAddress,
              id: tokenId,
            });
          } catch (err) {
            console.warn(err);
            return;
          }
        } else {
          tokenSlug = createTokenSlug({
            standard: TokenStandard.ERC20,
            address: ethers.getAddress(searchValue!),
            id: "0",
          });
        }

        findToken(chainId, currentAccount.address, tokenSlug);
      }, 300);

      return () => clearTimeout(t);
    }

    return;
  }, [
    chainId,
    provider,
    currentAccount.address,
    willSearch,
    isNftsSelected,
    searchValue,
    tokenIdSearchValue,
  ]);

  const searching = willSearch && syncing;

  return {
    currentAccount,
    isNftsSelected,
    searchValue,
    setSearchValue,
    tokenIdSearchValue,
    setTokenIdSearchValue,
    tokenIdSearchDisplayed,
    manageModeEnabled,
    setManageModeEnabled,
    tokens,
    syncing,
    searching,
    focusSearchInput,
    searchInputRef,
    tokenIdSearchInputRef,
    loadMoreTriggerRef,
    searchValueIsAddress,
  };
}

const TOKEN_SEARCH_PERSIST = "token_search_persist";
type TokenSearchPersist = {
  value: string;
  addedAt: number;
};

function useTokenSearchPersist(
  enabled: boolean,
  searchValue: string | null,
  setSearchValue: Dispatch<React.SetStateAction<string | null>>,
) {
  useEffect(() => {
    if (!enabled) {
      storage.remove(TOKEN_SEARCH_PERSIST).catch(console.error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    (async () => {
      try {
        const persist =
          await storage.fetchForce<TokenSearchPersist>(TOKEN_SEARCH_PERSIST);
        if (!persist) return;

        const { value, addedAt } = persist;
        if (ethers.isAddress(value) && addedAt > Date.now() - 30_000) {
          setSearchValue(value);
        } else {
          await storage.remove(TOKEN_SEARCH_PERSIST);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [enabled, setSearchValue]);

  useEffect(() => {
    if (!enabled) return;

    (async () => {
      try {
        if (searchValue && ethers.isAddress(searchValue)) {
          await storage.put<TokenSearchPersist>(TOKEN_SEARCH_PERSIST, {
            value: searchValue,
            addedAt: Date.now(),
          });
        } else {
          await storage.remove(TOKEN_SEARCH_PERSIST);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [enabled, searchValue]);
}
