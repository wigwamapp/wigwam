import {
  Dispatch,
  FC,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";
import classNames from "clsx";

import { TokenType } from "core/types";
import { tokenSlugAtom, tokenTypeAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
import { ReactComponent as SearchIcon } from "app/icons/assets-search.svg";
import { ReactComponent as ManageIcon } from "app/icons/assets-manage.svg";
import { ReactComponent as AddIcon } from "app/icons/assets-add.svg";
import { ReactComponent as HashTagIcon } from "app/icons/hashtag.svg";
import { ReactComponent as ChevronIcon } from "app/icons/chevron-left.svg";

import SearchInput from "./SearchInput";
import IconedButton, { IconedButtonProps } from "./IconedButton";
import AssetsSwitcher from "./AssetsSwitcher";

export type ManageMode = "manage" | "add" | "search" | null;

type AssetsManagementProps = {
  size?: "small" | "large";
  manageModeEnabled: boolean;
  setManageModeEnabled: Dispatch<SetStateAction<boolean>>;
  searchInputRef: RefObject<HTMLInputElement>;
  searchValue: string | null;
  setSearchValue: Dispatch<SetStateAction<string | null>>;
  tokenIdSearchValue: string | null;
  setTokenIdSearchValue: Dispatch<SetStateAction<string | null>>;
  tokenIdSearchInputRef: RefObject<HTMLInputElement>;
  tokenIdSearchDisplayed: boolean;
  mode: ManageMode;
  onModeChange: Dispatch<SetStateAction<ManageMode>>;
  className?: string;
};

const AssetsManagement: FC<AssetsManagementProps> = ({
  size = "large",
  manageModeEnabled,
  setManageModeEnabled,
  searchInputRef,
  searchValue,
  setSearchValue,
  tokenIdSearchValue,
  setTokenIdSearchValue,
  tokenIdSearchInputRef,
  tokenIdSearchDisplayed,
  className,
  mode,
  onModeChange,
}) => {
  const [tokenType, setTokenType] = useAtom(tokenTypeAtom);
  const [, setTokenSlug] = useAtom(tokenSlugAtom);

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

  const toggleManageMode = useCallback(
    (mode: ManageMode) => {
      onModeChange(mode);

      if (mode === "manage" || mode === "add") {
        if (!manageModeEnabled) {
          setTokenSlug([RESET, "replace"]);
        }
        setManageModeEnabled(true);
      }
    },
    [manageModeEnabled, setManageModeEnabled, onModeChange, setTokenSlug],
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
    <div
      className={classNames(
        "flex items-center justify-between gap-3 w-full",
        className,
      )}
    >
      {mode === null ? (
        <>
          <AssetsSwitcher
            theme={size}
            checked={tokenType === TokenType.NFT}
            onCheckedChange={toggleNftSwitcher}
            className="w-full"
          />

          <div className="flex gap-2">
            <TippySingletonProvider>
              <ManageButton
                size={size}
                Icon={SearchIcon}
                theme="secondary"
                aria-label={`Search ${tokenType === TokenType.Asset ? "tokens" : "nfts"} by name or address`}
                onClick={() => toggleManageMode("search")}
              />
              <ManageButton
                size={size}
                Icon={ManageIcon}
                theme="secondary"
                aria-label={`Manage ${tokenType === TokenType.Asset ? "tokens" : "nfts"} list`}
                onClick={() => toggleManageMode("manage")}
              />
              <ManageButton
                size={size}
                Icon={AddIcon}
                theme="secondary"
                aria-label={`Add a custom ${tokenType === TokenType.Asset ? "token" : "nft"}`}
                onClick={() => toggleManageMode("add")}
              />
            </TippySingletonProvider>
          </div>
        </>
      ) : (
        <>
          <ManageButton
            size={size}
            Icon={ChevronIcon}
            theme="secondary"
            aria-label={`Search ${tokenType === TokenType.Asset ? "tokens" : "nfts"} by name or address`}
            onClick={() => {
              setSearchValue(null);
              setTokenIdSearchValue(null);
              onModeChange(null);
              setManageModeEnabled(false);
            }}
          />

          <div
            className={classNames(
              "flex w-full gap-2",
              size === "small" ? "h-10" : "h-full",
            )}
          >
            <SearchInput
              ref={searchInputRef}
              searchValue={searchValue}
              toggleSearchValue={setSearchValue}
              className="h-full"
              inputClassName={classNames(
                "h-full !max-h-none",
                size === "small" ? "!py-2" : "",
              )}
              StartAdornment={input.Icon}
              placeholder={input.placeholder}
              autoFocus
            />

            {tokenIdSearchDisplayed && (
              <SearchInput
                ref={tokenIdSearchInputRef}
                searchValue={tokenIdSearchValue}
                toggleSearchValue={setTokenIdSearchValue}
                StartAdornment={HashTagIcon}
                className={classNames("max-w-[8rem] h-full")}
                inputClassName={classNames(
                  "h-full !max-h-none",
                  size === "small" ? "!py-2" : "",
                )}
                placeholder="Token ID..."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AssetsManagement;

const ManageButton: FC<IconedButtonProps & { size?: "small" | "large" }> = ({
  size = "large",
  className,
  iconProps,
  ...rest
}) => (
  <IconedButton
    className={classNames(
      "rounded-lg",
      size === "large"
        ? "!w-11 min-w-[2.75rem] !h-11"
        : "!w-10 !h-10 min-w-[2.5rem]",
      className,
    )}
    iconProps={{
      ...iconProps,
      className: classNames("!w-[1.15rem] !h-[1.15rem]", iconProps?.className),
    }}
    {...rest}
  />
);
