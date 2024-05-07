import { FC, useEffect, useMemo, useRef } from "react";
import { mergeRefs } from "react-merge-refs";
import { useAtomValue } from "jotai";
import BigNumber from "bignumber.js";
import classNames from "clsx";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import { useLazyAtomValue } from "lib/atom-utils";
import { TokenStandardValue } from "fixtures/tokens";

import { AccountAsset, TokenStatus, TokenType } from "core/types";
import { parseTokenSlug } from "core/common/tokens";
import { TEvent, trackEvent } from "core/client";
import { getTokenDetailsUrlAtom, tokenSlugAtom } from "app/atoms";
import {
  OverflowProvider,
  TippySingletonProvider,
  useAccountToken,
  useAccounts,
  useChainId,
  useExplorerLink,
  useHideToken,
  useLazyNetwork,
  useRamp,
  useTokenActivitiesSync,
} from "app/hooks";
import { Page } from "app/nav";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import AssetLogo from "app/components/elements/AssetLogo";
import IconedButton from "app/components/elements/IconedButton";
import FiatAmount from "app/components/elements/FiatAmount";
import PrettyAmount from "app/components/elements/PrettyAmount";
import Button from "app/components/elements/Button";
import PriceChange from "app/components/elements/PriceChange";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as CoinGeckoIcon } from "app/icons/coingecko.svg";
import { ReactComponent as SwapIcon } from "app/icons/swap.svg";
import { ReactComponent as SendIcon } from "app/icons/send-action.svg";
import { ReactComponent as ReceiveIcon } from "app/icons/buy-action.svg";
import { ReactComponent as BuyIcon } from "app/icons/plus-rounded.svg";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";

import TokenActivity from "./TokenActivity";

const AssetInfo: FC = () => {
  const { onRampCurrency } = useRamp();
  const tokenSlug = useAtomValue(tokenSlugAtom)!;

  const chainId = useChainId();
  const { currentAccount } = useAccounts();

  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);
  let tokenInfo = useAccountToken(tokenSlug) as AccountAsset | undefined;

  const tokenDetailsUrl = useLazyAtomValue(
    getTokenDetailsUrlAtom({ chainId, tokenSlug }),
    "off",
  );

  if (tokenInfo?.tokenType !== TokenType.Asset) {
    tokenInfo = undefined;
  }

  useTokenActivitiesSync(
    chainId,
    currentAccount.address,
    tokenInfo && tokenSlug,
  );

  const { standard, address } = useMemo(
    () => parseTokenSlug(tokenSlug),
    [tokenSlug],
  );

  const { copy, copied } = useCopyToClipboard(address);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const showBuyButton = useMemo(
    () => tokenInfo?.status !== TokenStatus.Disabled && onRampCurrency,
    [tokenInfo?.status, onRampCurrency],
  );

  useEffect(() => {
    scrollAreaRef.current?.scrollTo(0, 0);
  }, [tokenSlug]);

  const handleHideAsset = useHideToken(tokenInfo);

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

  return (
    <OverflowProvider>
      {(ref) => (
        <ScrollAreaContainer
          ref={mergeRefs([ref, scrollAreaRef])}
          hiddenScrollbar="horizontal"
          className="pr-5 -mr-5 flex flex-col w-full"
          viewPortClassName="pl-6 pt-6 viewportBlock"
          scrollBarClassName="py-0 pt-[18.75rem]"
          type="scroll"
        >
          <div>
            <div className="flex mb-5">
              <AssetLogo
                asset={tokenInfo!}
                alt={name}
                className="w-[5.125rem] h-[5.125rem] min-w-[5.125rem] mr-5"
              />
              <div className="flex flex-col justify-between grow min-w-0">
                <div className="flex items-center">
                  <h2
                    className={classNames(
                      "text-2xl font-bold",
                      "mr-4",
                      "truncate",
                    )}
                  >
                    {name}
                  </h2>
                  <TippySingletonProvider>
                    <div className="ml-auto flex items-center">
                      {tokenDetailsUrl && (
                        <IconedButton
                          aria-label="View chart and token info"
                          Icon={CoinGeckoIcon}
                          className={classNames(
                            "!w-6 !h-6 min-w-[1.5rem]",
                            status !== TokenStatus.Native ? "mr-2" : "",
                          )}
                          iconClassName="!w-[1.125rem]"
                          href={tokenDetailsUrl}
                        />
                      )}
                      {explorerLink && status !== TokenStatus.Native && (
                        <IconedButton
                          aria-label="View token in Explorer"
                          Icon={WalletExplorerIcon}
                          className="!w-6 !h-6 min-w-[1.5rem] mr-2"
                          iconClassName="!w-[1.125rem]"
                          href={explorerLink.token(address)}
                        />
                      )}
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
                          onClick={() => copy()}
                        />
                      )}
                      {status !== TokenStatus.Native && (
                        <IconedButton
                          aria-label="Hide token"
                          Icon={EyeIcon}
                          onClick={() => handleHideAsset()}
                          className="!w-6 !h-6 min-w-[1.5rem]"
                          iconClassName="!w-[1.125rem]"
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
            <div className="mt-6 grid grid-cols-4 gap-2">
              <Button
                to={{ page: Page.Transfer }}
                merge={["token"]}
                theme="secondary"
                className="grow !py-2 !min-w-0 text-sm"
              >
                <SendIcon className="w-4 h-auto mr-2" />
                Send
              </Button>
              <Button
                to={{ receiveOpened: true, receiveToken: tokenSlug }}
                merge={["token"]}
                theme="secondary"
                className="grow !py-2 !min-w-0 text-sm"
              >
                <ReceiveIcon className="w-4 h-auto mr-2" />
                Receive
              </Button>
              <Button
                to={{
                  onRampOpened: true,
                  token: tokenSlug,
                }}
                merge
                theme="secondary"
                className="grow !py-2 !min-w-0 text-sm"
                disabled={!showBuyButton}
                title={showBuyButton ? undefined : "Coming soon"}
                onClick={() => {
                  trackEvent(TEvent.BuyNavigated, {
                    page: "dashboard",
                    tokenName: name,
                    tokenSymbol: symbol,
                    chainId,
                  });
                }}
              >
                <BuyIcon className="w-4 h-auto mr-2" />
                Buy
              </Button>
              <Button
                to={{ page: Page.Swap }}
                merge={["token"]}
                theme="secondary"
                className="grow !py-2 !min-w-0 text-sm"
                title={`Swap ${symbol}`}
                onClick={() => {
                  trackEvent(TEvent.SwapNavigated, {
                    page: "dashboard",
                    tokenName: name,
                    tokenSymbol: symbol,
                    chainId,
                  });
                }}
              >
                <SwapIcon className="w-4 h-auto mr-2" />
                Swap
              </Button>
            </div>

            <TokenActivity token={tokenInfo!} />

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
