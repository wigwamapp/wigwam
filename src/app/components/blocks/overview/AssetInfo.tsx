import { FC, useEffect, useMemo, useRef } from "react";
import { mergeRefs } from "react-merge-refs";
import { useAtomValue } from "jotai";
import BigNumber from "bignumber.js";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";

import { COINGECKO_NATIVE_TOKEN_IDS } from "fixtures/networks";

import { AccountAsset, TokenStatus } from "core/types";
import { parseTokenSlug } from "core/common/tokens";

import { currentAccountAtom, tokenSlugAtom } from "app/atoms";
import {
  OverflowProvider,
  TippySingletonProvider,
  useAccountToken,
  useChainId,
  useExplorerLink,
  useLazyNetwork,
  useTokenActivitiesSync,
} from "app/hooks";
import { Page, ReceiveTab as ReceiveTabEnum } from "app/nav";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import AssetLogo from "app/components/elements/AssetLogo";
import IconedButton from "app/components/elements/IconedButton";
import FiatAmount from "app/components/elements/FiatAmount";
import PrettyAmount from "app/components/elements/PrettyAmount";
import Button from "app/components/elements/Button";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as CoinGeckoIcon } from "app/icons/coint-gecko.svg";
import { ReactComponent as SendIcon } from "app/icons/send-small.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as BuyIcon } from "app/icons/buy.svg";

import PriceChange from "./PriceChange";
import TokenActivity from "./TokenActivity";

export enum TokenStandardValue {
  NATIVE = "Native",
  ERC20 = "ERC-20",
  ERC721 = "ERC-721",
  ERC777 = "ERC-777",
  ERC1155 = "ERC-1155",
}

const AssetInfo: FC = () => {
  const tokenSlug = useAtomValue(tokenSlugAtom)!;

  const chainId = useChainId();
  const currentAccount = useAtomValue(currentAccountAtom);

  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);
  const tokenInfo = useAccountToken(tokenSlug) as AccountAsset | undefined;

  useTokenActivitiesSync(
    chainId,
    currentAccount.address,
    tokenInfo && tokenSlug
  );

  const { standard, address } = useMemo(
    () => parseTokenSlug(tokenSlug),
    [tokenSlug]
  );

  const { copy, copied } = useCopyToClipboard(address);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo(0, 0);
  }, [tokenSlug]);

  if (!tokenInfo) return null;

  const {
    status,
    name,
    symbol,
    rawBalance,
    decimals,
    priceUSD,
    priceUSDChange,
    balanceUSD,
  } = tokenInfo;

  const coinGeckoId =
    status === TokenStatus.Native
      ? COINGECKO_NATIVE_TOKEN_IDS.get(chainId)
      : address;

  return (
    <OverflowProvider>
      {(ref) => (
        <ScrollAreaContainer
          ref={mergeRefs([ref, scrollAreaRef])}
          hiddenScrollbar="horizontal"
          className="ml-6 pr-5 -mr-5 flex flex-col"
          viewPortClassName="pb-20 pt-6 viewportBlock"
          scrollBarClassName="py-0 pt-[18.75rem] pb-20"
          type="scroll"
        >
          <div className="w-[31.5rem]">
            <div className="flex mb-5">
              <AssetLogo
                asset={tokenInfo}
                alt={name}
                className="w-[5.125rem] h-[5.125rem] min-w-[5.125rem] mr-5"
              />
              <div className="flex flex-col justify-between grow min-w-0">
                <div className="flex items-center">
                  <h2
                    className={classNames(
                      "text-2xl font-bold",
                      "mr-4",
                      "truncate"
                    )}
                  >
                    {name}
                  </h2>
                  <TippySingletonProvider>
                    <div className="ml-auto flex items-center">
                      {status !== TokenStatus.Native && (
                        <IconedButton
                          aria-label={
                            copied
                              ? "Copied"
                              : `Copy ${TokenStandardValue[standard]} token address`
                          }
                          Icon={copied ? SuccessIcon : CopyIcon}
                          className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                          iconClassName="!w-[1.125rem]"
                          onClick={copy}
                        />
                      )}
                      {explorerLink && status !== TokenStatus.Native && (
                        <IconedButton
                          aria-label="View asset in Explorer"
                          Icon={WalletExplorerIcon}
                          className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                          iconClassName="!w-[1.125rem]"
                          href={explorerLink.address(address)}
                        />
                      )}
                      {currentNetwork?.type === "mainnet" && coinGeckoId && (
                        <IconedButton
                          aria-label="View asset in CoinGecko"
                          Icon={CoinGeckoIcon}
                          className="!w-6 !h-6 min-w-[1.5rem]"
                          iconClassName="!w-[1.125rem]"
                          href={`https://www.coingecko.com/en/coins/${coinGeckoId}`}
                        />
                      )}
                    </div>
                  </TippySingletonProvider>
                </div>
                <div className="flex flex-col">
                  <span className="text-base text-brand-gray leading-none mb-0.5">
                    Price
                  </span>
                  <span className="flex items-center">
                    <FiatAmount
                      amount={priceUSD ?? 0}
                      copiable
                      className="text-lg font-bold leading-6 mr-3"
                    />
                    {priceUSDChange && (
                      <PriceChange priceChange={priceUSDChange} isPercent />
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-base text-brand-gray leading-none mb-3">
                Balance
              </div>

              <div className="flex items-end">
                <FiatAmount
                  amount={balanceUSD ?? 0}
                  copiable
                  className="text-[1.75rem] font-bold leading-none mr-4"
                />
                {priceUSDChange && (
                  <PriceChange
                    priceChange={new BigNumber(priceUSDChange)
                      .times(balanceUSD)
                      .div(100)}
                  />
                )}
              </div>
              <div className="mt-1">
                <PrettyAmount
                  amount={rawBalance ?? 0}
                  decimals={decimals}
                  currency={symbol}
                  copiable
                  className="text-lg text-brand-inactivelight"
                />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <Button
                to={{ page: Page.Transfer }}
                merge={["token"]}
                theme="secondary"
                className="grow !py-2"
              >
                <SendIcon className="w-6 h-auto mr-2" />
                Transfer
              </Button>
              <Button
                to={{ page: Page.Swap }}
                theme="secondary"
                className="grow !py-2"
                disabled
                title="Coming soon"
              >
                <SwapIcon className="w-6 h-auto mr-2" />
                Swap
              </Button>
              {status === TokenStatus.Native && (
                <Button
                  to={{
                    page: Page.Receive,
                    receive: ReceiveTabEnum.BuyWithCrypto,
                  }}
                  theme="secondary"
                  className="grow !py-2"
                  disabled
                  title="Coming soon"
                >
                  <BuyIcon className="w-6 h-auto mr-2" />
                  Buy
                </Button>
              )}
            </div>

            <TokenActivity />

            {/*{status !== TokenStatus.Native && (*/}
            {/*  <div className="mt-6 max-w-[23.25rem]">*/}
            {/*    <AddressField*/}
            {/*      key={address}*/}
            {/*      label="Token address"*/}
            {/*      value={address}*/}
            {/*      readOnly*/}
            {/*      labelActions={standard ? <Tag standard={standard} /> : undefined}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*)}*/}
          </div>
        </ScrollAreaContainer>
      )}
    </OverflowProvider>
  );
};

export default AssetInfo;
