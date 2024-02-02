import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import classNames from "clsx";

import { TokenType } from "core/types";
import { tokenSlugAtom, tokenTypeAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
import { useTokenList } from "app/hooks/tokenList";
import { ReactComponent as SearchIcon } from "app/icons/assets-search.svg";
import { ReactComponent as ManageIcon } from "app/icons/assets-manage.svg";
import { ReactComponent as AddIcon } from "app/icons/assets-add.svg";
import { ReactComponent as HashTagIcon } from "app/icons/hashtag.svg";
import { ReactComponent as ChevronIcon } from "app/icons/chevron-right.svg";

import SearchInput from "./SearchInput";
import IconedButton, { IconedButtonProps } from "./IconedButton";
import AssetsSwitcher from "./AssetsSwitcher";

type ManageMode = "manage" | "add" | "search" | null;

const AssetsManagement: FC = ({}) => {
  const [tokenType, setTokenType] = useAtom(tokenTypeAtom);
  const [, setTokenSlug] = useAtom(tokenSlugAtom);
  const [mode, setMode] = useState<ManageMode>(null);

  const tokenTypeChangedHereRef = useRef<boolean>(true);

  const toggleNftSwitcher = useCallback(
    (value: boolean) => {
      tokenTypeChangedHereRef.current = true;

      setTokenSlug([RESET, "replace"]);
      setTokenType(value ? TokenType.NFT : TokenType.Asset);
    },
    [setTokenType, setTokenSlug],
  );

  useEffect(() => {
    if (tokenTypeChangedHereRef.current) {
      tokenTypeChangedHereRef.current = false;
      return;
    }

    setTokenSlug([RESET, "replace"]);
  }, [tokenType, setTokenSlug]);

  const {
    manageModeEnabled,
    setManageModeEnabled,
    searchInputRef,
    searchValue,
    setSearchValue,
    tokenIdSearchValue,
    setTokenIdSearchValue,
    tokenIdSearchInputRef,
    tokenIdSearchDisplayed,
  } = useTokenList(tokenType);

  const toggleManageMode = useCallback(
    (mode: ManageMode) => {
      setMode(mode);

      if (mode === "manage" || mode === "add") {
        if (!manageModeEnabled) {
          setTokenSlug([RESET, "replace"]);
        }
        setManageModeEnabled(true);
      }
    },
    [manageModeEnabled, setManageModeEnabled, setTokenSlug],
  );

  const input = useMemo(() => {
    let args: { placeholder: string; Icon?: FC } = {
      placeholder: "",
    };
    const tokenTypeName = tokenType === TokenType.Asset ? "token" : "NFT";

    switch (mode) {
      case "add": {
        args = {
          placeholder: `Add ${tokenTypeName} by address`,
          Icon: AddIcon,
        };
        break;
      }
      case "search": {
        args = {
          placeholder: `Search ${tokenTypeName} by address or name`,
        };
        break;
      }
      case "manage": {
        args = {
          placeholder: `Search ${tokenTypeName} by address or name`,
        };
        break;
      }
      default:
        return args;
    }

    return args;
  }, [mode, tokenType]);

  return (
    <div className="flex items-center gap-3">
      <TippySingletonProvider>
        {mode === null ? (
          <>
            <AssetsSwitcher
              checked={tokenType === TokenType.NFT}
              onCheckedChange={toggleNftSwitcher}
              className="w-full"
            />

            <div className="flex w-full gap-2">
              <ManageButton
                Icon={SearchIcon}
                theme="secondary"
                aria-label={`Search ${tokenType === TokenType.Asset ? "tokens" : "nfts"} by name or address`}
                onClick={() => toggleManageMode("search")}
              />
              <ManageButton
                Icon={ManageIcon}
                theme="secondary"
                aria-label={`Manage ${tokenType === TokenType.Asset ? "tokens" : "nfts"} list`}
                onClick={() => toggleManageMode("manage")}
              />
              <ManageButton
                Icon={AddIcon}
                theme="secondary"
                aria-label={`Add a custom ${tokenType === TokenType.Asset ? "token" : "nft"}`}
                onClick={() => toggleManageMode("add")}
              />
            </div>
          </>
        ) : (
          <>
            <ManageButton
              Icon={ChevronIcon}
              theme="secondary"
              aria-label={`Search ${tokenType === TokenType.Asset ? "tokens" : "nfts"} by name or address`}
              onClick={() => {
                setMode(null);
                setManageModeEnabled(false);
              }}
            />

            <div className="flex w-full h-full gap-2">
              <SearchInput
                ref={searchInputRef}
                searchValue={searchValue}
                toggleSearchValue={setSearchValue}
                className="h-full"
                inputClassName="h-full !max-h-none"
                StartAdornment={input.Icon}
                placeholder={input.placeholder}
              />

              {tokenIdSearchDisplayed && (
                <SearchInput
                  ref={tokenIdSearchInputRef}
                  searchValue={tokenIdSearchValue}
                  toggleSearchValue={setTokenIdSearchValue}
                  StartAdornment={HashTagIcon}
                  className="max-w-[8rem] h-full"
                  inputClassName="h-full !max-h-none"
                  placeholder="Token ID..."
                />
              )}
            </div>
          </>
        )}
      </TippySingletonProvider>
    </div>
  );
};

export default AssetsManagement;

const ManageButton: FC<IconedButtonProps> = ({
  className,
  iconProps,
  ...rest
}) => (
  <IconedButton
    className={classNames("!w-11 min-w-[2.75rem] !h-11 rounded-lg", className)}
    iconProps={{
      ...iconProps,
      className: classNames("!w-5 !h-5", iconProps?.className),
    }}
    {...rest}
  />
);
