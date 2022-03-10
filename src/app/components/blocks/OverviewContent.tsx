import {
  FC,
  forwardRef,
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import classNames from "clsx";
import { useAtom, useAtomValue } from "jotai";
import { RESET } from "jotai/utils";
import { TReplace } from "lib/ext/i18n/react";

import { AccountAsset, TokenStandard, TokenType } from "core/types";
import { parseTokenSlug } from "core/common/tokens";

import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import { useAccountTokens, useToken } from "app/hooks/tokens";
import AssetsSwitcher from "app/components/elements/AssetsSwitcher";
import IconedButton from "app/components/elements/IconedButton";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import NewButton from "app/components/elements/NewButton";
import SearchInput from "app/components/elements/SearchInput";
import PrettyAmount from "app/components/elements/PrettyAmount";
import { ReactComponent as ConfigIcon } from "app/icons/control.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as ActivityIcon } from "app/icons/activity.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as ClockIcon } from "app/icons/clock.svg";

const OverviewContent: FC = () => (
  <div className="flex mt-6 min-h-0 grow">
    <AssetsList />
    <AssetInfo />
  </div>
);

export default OverviewContent;

const AssetsList: FC = () => {
  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const [isNftsSelected, setIsNftsSelected] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const { tokens, loadMore, hasMore } = useAccountTokens(
    TokenType.Asset,
    currentAccount.address,
    { search: searchValue ?? undefined, limit: 10 }
  );

  const observer = useRef<IntersectionObserver>();
  const lastAssetRef = useCallback(
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
    if (tokens && tokens[0] && !tokenSlug) {
      setTokenSlug([tokens[0].tokenSlug, "replace"]);
    }
  }, [setTokenSlug, tokenSlug, tokens]);

  return (
    <div
      className={classNames(
        "w-[23.25rem] min-w-[23.25rem] pr-6",
        "border-r border-brand-main/[.07]",
        "flex flex-col"
      )}
    >
      <AssetsSwitcher
        checked={isNftsSelected}
        onCheckedChange={setIsNftsSelected}
        className="mx-auto mb-3"
      />
      <div className="flex items-center">
        <SearchInput
          searchValue={searchValue}
          toggleSearchValue={setSearchValue}
        />
        <IconedButton
          Icon={ConfigIcon}
          theme="tertiary"
          className="ml-2"
          aria-label="Manage assets list"
        />
      </div>
      <ScrollAreaContainer
        className="pr-5 -mr-5 mt-4"
        viewPortClassName="pb-20 rounded-t-[.625rem]"
        scrollBarClassName="py-0 pb-20"
      >
        {tokens.map((asset, i) => {
          const isLastOne = i === tokens.length - 1;

          return (
            <AssetCard
              key={asset.tokenSlug}
              ref={isLastOne ? lastAssetRef : null}
              asset={asset as AccountAsset}
              isActive={tokenSlug === asset.tokenSlug}
              onAssetSelect={() => {
                setTokenSlug([asset.tokenSlug, "replace"]);
                setSearchValue(null);
              }}
              className={classNames(!isLastOne && "mb-2")}
            />
          );
        })}
      </ScrollAreaContainer>
    </div>
  );
};

type AssetCardProps = {
  asset: AccountAsset;
  isActive?: boolean;
  onAssetSelect: () => void;
  className?: string;
};

const AssetCard = forwardRef<HTMLButtonElement, AssetCardProps>(
  ({ asset, isActive = false, onAssetSelect, className }, ref) => {
    const { logoUrl, name, symbol, rawBalance, decimals, balanceUSD } = asset;

    return (
      <button
        ref={ref}
        type="button"
        onClick={onAssetSelect}
        className={classNames(
          "flex items-stretch",
          "w-full p-3",
          "text-left",
          "rounded-[.625rem]",
          "group",
          "transition-colors",
          !isActive && "hover:bg-brand-main/10",
          isActive && "bg-brand-main/20",
          className
        )}
      >
        <span
          className={classNames(
            "block",
            "w-11 h-11 min-w-[2.75rem] mr-3",
            "bg-white",
            "rounded-full overflow-hidden"
          )}
        >
          <img
            src={logoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </span>
        <span className="flex flex-col w-full">
          <span className="text-sm font-bold leading-4">
            <TReplace msg={name} />
          </span>
          <span className="mt-auto flex justify-between items-end">
            <PrettyAmount
              amount={rawBalance ?? 0}
              decimals={decimals}
              currency={symbol}
              className="text-base font-bold leading-4"
            />
            <PrettyAmount
              amount={balanceUSD ?? 0}
              currency="$"
              className={classNames(
                "ml-2",
                "text-sm leading-4",
                !isActive && "text-brand-inactivedark",
                isActive && "text-brand-light",
                "transition-colors",
                "group-hover:text-brand-light"
              )}
            />
          </span>
        </span>
      </button>
    );
  }
);

const AssetInfo: FC = () => {
  const [tokenSlug, setTokenSlug] = useAtom(tokenSlugAtom)!;
  // const currentAccount = useAtomValue(currentAccountAtom);
  // const { tokens } = useAccountTokens(TokenType.Asset, currentAccount.address, {
  //   limit: 1,
  // });

  const handleTokenReset = useCallback(
    () => setTokenSlug([RESET]),
    [setTokenSlug]
  );

  const tokenInfo = useToken(tokenSlug, handleTokenReset) as AccountAsset;
  const parsedTokenSlug = useMemo(
    () => tokenSlug && parseTokenSlug(tokenSlug),
    [tokenSlug]
  );

  // if (!tokenInfo && tokens[0]) {
  //   setTokenSlug([tokens[0].tokenSlug, "replace"]);
  // }
  if (!tokenInfo || !parsedTokenSlug) {
    return <></>;
  }

  const { logoUrl, name, symbol, rawBalance, decimals, priceUSD, balanceUSD } =
    tokenInfo;
  const { standard } = parsedTokenSlug;

  return (
    <div className="w-[31.5rem] ml-6 pb-20 flex flex-col">
      <div className="flex mb-4">
        <div
          className={classNames(
            "w-[5.125rem] h-[5.125rem] min-w-[5.125rem] mr-5",
            "bg-white",
            "rounded-full overflow-hidden"
          )}
        >
          <img
            src={logoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between grow min-w-0">
          <div className="flex items-center">
            <h2
              className={classNames("text-2xl font-bold", "mr-3", "truncate")}
            >
              {name}
            </h2>
            {standard && <Tag standard={standard} />}
            <IconedButton
              aria-label="View wallet transactions in explorer"
              Icon={WalletExplorerIcon}
              className="!w-6 !h-6 min-w-[1.5rem] ml-auto"
              iconClassName="!w-[1.125rem]"
            />
            <IconedButton
              aria-label="View wallet transactions in explorer"
              Icon={ClockIcon}
              className="!w-6 !h-6 min-w-[1.5rem] ml-2"
              iconClassName="!w-[1.125rem]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base text-brand-gray leading-none mb-0.5">
              Price
            </span>
            <span className="flex items-center">
              <PrettyAmount
                amount={priceUSD ?? 0}
                currency="$"
                copiable
                className="text-lg font-bold leading-6 mr-3"
              />
              <PriceChange priceChange="2.8" isPercent />
            </span>
          </div>
        </div>
      </div>
      <div>
        <div className="text-base text-brand-gray leading-none mb-3">
          Balance
        </div>
        <div>
          <PrettyAmount
            amount={rawBalance ?? 0}
            decimals={decimals}
            currency={symbol}
            copiable
            className="text-[1.75rem] font-bold leading-none"
          />

          <PrettyAmount
            amount={balanceUSD ?? 0}
            currency="$"
            copiable
            className="text-base text-brand-inactivedark ml-8 mr-4"
          />

          <PriceChange priceChange={"-2.8"} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <NewButton theme="secondary" className="grow !py-2">
          <SendIcon className="mr-2" />
          Transfer
        </NewButton>
        <NewButton theme="secondary" className="grow !py-2">
          <SwapIcon className="mr-2" />
          Swap
        </NewButton>
        <NewButton theme="secondary" className="grow !py-2">
          <ActivityIcon className="mr-2" />
          Activity
        </NewButton>
      </div>
    </div>
  );
};

enum TokenStandardValue {
  ERC20 = "ERC-20",
  ERC721 = "ERC-721",
  ERC777 = "ERC-777",
  ERC1155 = "ERC-1155",
}

type TagProps = { standard: TokenStandard };

const Tag: FC<TagProps> = ({ standard }) => (
  <span
    className={classNames(
      "py-2 px-4 mr-4",
      "text-base font-bold leading-none",
      "border border-brand-main/20",
      "rounded-[.625rem]",
      "whitespace-nowrap"
    )}
  >
    {TokenStandardValue[standard]}
  </span>
);

type PriceChangeProps = {
  priceChange: string;
  isPercent?: boolean;
};

const PriceChange: FC<PriceChangeProps> = ({
  priceChange,
  isPercent = false,
}) => {
  const priceChangeNumber = +priceChange;

  if (!priceChangeNumber || priceChangeNumber === 0) {
    return <></>;
  }

  const isPositive = priceChangeNumber > 0;

  return (
    <span
      className={classNames(
        isPercent && "text-sm leading-4",
        !isPercent && "text-base",
        "font-bold",
        isPercent && "py-1 px-2",
        "rounded-md",
        isPositive && isPercent && "bg-[#4F9A5E]",
        !isPositive && isPercent && "bg-[#B82D41]",
        isPositive && !isPercent && "text-[#6BB77A]",
        !isPositive && !isPercent && "text-[#EA556A]"
      )}
    >
      {isPositive ? "+" : "-"}
      {!isPercent ? "$" : ""}
      {Math.abs(priceChangeNumber)}
      {isPercent ? "%" : ""}
    </span>
  );
};
