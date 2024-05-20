import { FC, PropsWithChildren, useMemo } from "react";
import classNames from "clsx";
import BigNumber from "bignumber.js";

import {
  AccountAsset,
  ActivitySource,
  FeeMode,
  FeeSuggestions,
  TxAction,
  TxActionType,
} from "core/types";
import { NATIVE_TOKEN_SLUG } from "core/common/tokens";

import {
  TippySingletonProvider,
  useExplorerLink,
  useLazyNetwork,
  useToken,
} from "app/hooks";
import { CUSTOM_FEE_MODE, FEE_MODE_NAMES } from "app/utils/txApprove";
import TabHeader from "app/components/elements/approvals/TabHeader";
import PrettyAmount from "app/components/elements/PrettyAmount";
import FiatAmount from "app/components/elements/FiatAmount";
import HashPreview from "app/components/elements/HashPreview";
import IconedButton from "app/components/elements/IconedButton";
import SmallContactCard from "app/components/elements/SmallContactCard";
import Dot from "app/components/elements/Dot";
import TokenAmount from "app/components/blocks/TokenAmount";
import { ReactComponent as WalletExplorerIcon } from "app/icons/external-link.svg";
import { ReactComponent as ChevronRightIcon } from "app/icons/chevron-right.svg";
import { ReactComponent as GasIcon } from "app/icons/gas.svg";

type DetailsTabProps = Omit<FeeButton, "onClick"> & {
  accountAddress: string;
  action: TxAction;
  source: ActivitySource;
  onFeeButtonClick: () => void;
};

const ActivitySwap: FC<{ source: ActivitySource }> = ({ source }) => {
  if (source.type === "self" && source.swapMeta) {
    const route = source.swapMeta;
    return (
      <InfoRaw label={"Swap info"} flexAlignPosition="items-center">
        <div
          className={classNames(
            "flex flex-col items-center justify-center",
            "w-fit",
          )}
        >
          <div className="inline-flex">
            <PrettyAmount
              amount={route.fromAmount}
              decimals={route.fromToken.decimals}
              currency={route.fromToken.symbol}
              threeDots={false}
              copiable
              className={classNames("text-xs ml-1.5", "font-bold")}
            />{" "}
            <img
              src={route.fromToken.logoURI}
              alt={route.fromToken.name}
              className="ml-1 mr-2 w-4 h-4 rounded-full"
            />
          </div>
          <div
            className={classNames("text-xs font-bold")}
            style={{ transform: "rotate(90deg)" }}
          >
            {" →"}
          </div>
          <div className="inline-flex">
            <PrettyAmount
              amount={route.toAmount}
              decimals={route.toToken.decimals}
              currency={route.toToken.symbol}
              threeDots={false}
              copiable
              className={classNames("text-xs ml-1.5", "font-bold")}
            />{" "}
            <img
              src={route.toToken.logoURI}
              alt={route.toToken.name}
              className="ml-1 w-4 h-4 rounded-full"
            />
          </div>
        </div>
      </InfoRaw>
    );
  } else {
    return null;
  }
};

const DetailsTab: FC<DetailsTabProps> = ({
  accountAddress,
  fees,
  l1Fee,
  gasLimit,
  averageGasLimit,
  maxFee,
  averageFee,
  feeMode,
  action,
  source,
  onFeeButtonClick,
}) => {
  const tabHeader = useMemo(
    () => getTabHeader(action, source),
    [action, source],
  );
  const withDescription = useMemo(
    () => action.type === TxActionType.TokenApprove && !action.clears,
    [action],
  );

  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);

  const cancelTx =
    source.replaceTx?.type === "cancel" ||
    source.replaceTx?.prevReplaceTxType === "cancel";

  return (
    <>
      <TabHeader
        className={classNames(
          "flex items-center w-full",
          withDescription ? "!mb-1" : "",
        )}
      >
        {cancelTx ? "Cancel transaction" : tabHeader}
        {source.replaceTx?.type === "speedup" && (
          <>
            <span className="flex-1" />
            <span className="text-xs text-brand-inactivedark font-medium inline-flex items-center">
              <GasIcon className="w-3 h-3 mr-1" />
              Speed up
            </span>
          </>
        )}
      </TabHeader>
      {withDescription && (
        <p className="text-sm text-[#BCC3C4] mb-3">
          {source.type === "self" && source.swapMeta ? (
            <>
              By granting this permission, you&#39;re allowing this
              smart-contract to automate transactions for you.
            </>
          ) : (
            <>
              Do you trust this site? By granting this permission, you&apos;re
              allowing{" "}
              <span className="font-semibold">
                {source.type === "page" && source.url
                  ? new URL(source.url).host
                  : "this site"}
              </span>{" "}
              to withdraw tokens and automate transactions for you.
            </>
          )}
        </p>
      )}
      <FeeButton
        accountAddress={accountAddress}
        fees={fees}
        l1Fee={l1Fee}
        gasLimit={gasLimit}
        averageGasLimit={averageGasLimit}
        maxFee={maxFee}
        averageFee={averageFee}
        feeMode={feeMode}
        onClick={onFeeButtonClick}
      />
      {cancelTx ? (
        <>
          <InfoRaw label="Transaction">
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <TippySingletonProvider>
                  <HashPreview
                    hash={source.replaceTx!.prevTxHash}
                    className="text-sm"
                    startLength={8}
                    endLength={6}
                  />
                  {explorerLink && (
                    <IconedButton
                      href={explorerLink.tx(source.replaceTx!.prevTxHash)}
                      aria-label="View in Explorer"
                      Icon={WalletExplorerIcon}
                      className="!w-6 !h-6 ml-2"
                      iconClassName="!w-[1.125rem]"
                    />
                  )}
                </TippySingletonProvider>
              </div>
            </div>
          </InfoRaw>
        </>
      ) : (
        <>
          <Recipient action={action} />
          <Tokens accountAddress={accountAddress} action={action} />
          <ActivitySwap source={source} />
        </>
      )}
    </>
  );
};

export default DetailsTab;

const getTabHeader = (action: TxAction, source: ActivitySource) => {
  switch (action.type) {
    case TxActionType.TokenTransfer:
      return "Transfer tokens";
    case TxActionType.TokenApprove:
      if (action.clears) {
        return "Revoke tokens approval";
      }
      if (source.type === "self" && source.swapMeta) {
        return "Approve tokens for swap";
      }
      return "Approve tokens";
    case TxActionType.ContractInteraction:
      if (source.type === "self" && source.swapMeta) {
        if (source.swapMeta.fromChainId !== source.swapMeta.toChainId) {
          return "Bridge transaction";
        } else {
          return "Swap transaction";
        }
      } else {
        return "Interact with contract";
      }
    default:
      return "Deploy contract";
  }
};

type FeeButton = {
  accountAddress: string;
  fees: FeeSuggestions;
  l1Fee: bigint | null;
  gasLimit: bigint;
  averageGasLimit: bigint;
  maxFee: bigint | null;
  averageFee: bigint | null;
  feeMode: FeeMode;
  onClick: () => void;
};

const FeeButton: FC<FeeButton> = ({
  accountAddress,
  gasLimit,
  averageGasLimit,
  fees,
  l1Fee,
  maxFee,
  averageFee,
  feeMode,
  onClick,
}) => {
  gasLimit = useMemo(
    () => (gasLimit > averageGasLimit ? averageGasLimit : gasLimit),
    [averageGasLimit, gasLimit],
  );

  const nativeToken = useToken<AccountAsset>(accountAddress);

  const averageFeeBN = averageFee ? new BigNumber(averageFee.toString()) : null;
  const modeFee = (
    gasLimit * fees.modes[feeMode].max +
    (l1Fee ?? 0n)
  ).toString();

  const isCustomMode = !averageFeeBN?.eq(modeFee);

  const usdAmount =
    nativeToken?.priceUSD && averageFeeBN
      ? averageFeeBN
          .div(new BigNumber(10).pow(nativeToken.decimals))
          .multipliedBy(nativeToken.priceUSD)
      : new BigNumber(0);

  return (
    <button
      type="button"
      className={classNames(
        "w-full",
        "rounded-[.625rem]",
        "flex items-center",
        "py-3 pr-2 pl-4 mb-3",
        "bg-brand-main/5",
        "transition-colors",
        "hover:bg-brand-main/10",
      )}
      onClick={onClick}
    >
      <span className="flex flex-col grow">
        <span
          className={classNames(
            "flex items-center justify-between",
            "mb-0.5",
            "text-sm",
          )}
        >
          Network fee
          {averageFeeBN ? (
            <span className="ml-auto flex items-center">
              <PrettyAmount
                amount={averageFeeBN}
                currency={nativeToken?.symbol}
                decimals={nativeToken?.decimals}
                threeDots={false}
                className=""
              />
              <Dot />
              <FiatAmount
                amount={usdAmount}
                threeDots={false}
                className="font-bold"
              />
            </span>
          ) : null}
        </span>
        <span
          className={classNames("flex items-center justify-between", "text-xs")}
        >
          <FeeModeLabel feeMode={isCustomMode ? "custom" : feeMode} />

          {maxFee && nativeToken ? (
            <span className="">
              <span className="font-semibold">Max fee:</span>
              <PrettyAmount
                amount={maxFee.toString()}
                decimals={nativeToken.decimals}
                currency={nativeToken.symbol}
                threeDots={false}
                className="ml-2 mb-0"
              />
            </span>
          ) : null}
        </span>
      </span>
      <ChevronRightIcon className="w-6 h-auto ml-2" />
    </button>
  );
};

type FeeModeLabelProps = {
  feeMode: FeeMode | "custom";
};

const FeeModeLabel: FC<FeeModeLabelProps> = ({ feeMode }) => {
  const { icon, name } =
    feeMode === "custom" ? CUSTOM_FEE_MODE : FEE_MODE_NAMES[feeMode];

  return (
    <span
      className={classNames(
        "py-0.5 pl-1.5 pr-2.5",
        "rounded-md",
        "border border-brand-main/[.07] text-sm",
        "flex items-center",
      )}
    >
      <span className="mr-1.5 text-xs">{icon}</span>
      <span className="-mt-px text-xs">{name}</span>
    </span>
  );
};

type RecipientProps = {
  action: TxAction;
};

const Recipient: FC<RecipientProps> = ({ action }) => {
  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);
  const label = useMemo(() => getRecipientLabel(action), [action]);
  const address = useMemo(() => getRecipientAddress(action), [action]);

  if (!address) {
    return null;
  }

  return (
    <InfoRaw label={label}>
      <div className="flex flex-col items-end">
        <div className="flex items-center">
          <TippySingletonProvider>
            <HashPreview hash={address} className="text-sm" />
            {explorerLink && (
              <IconedButton
                href={explorerLink.address(address)}
                aria-label="View in Explorer"
                Icon={WalletExplorerIcon}
                className="!w-6 !h-6 ml-2"
                iconClassName="!w-[1.125rem]"
              />
            )}
          </TippySingletonProvider>
        </div>
        {action.type === TxActionType.TokenTransfer && (
          <SmallContactCard
            address={address}
            isAddable={false}
            className="mt-2 mb-0"
          />
        )}
      </div>
    </InfoRaw>
  );
};

const getRecipientLabel = (action: TxAction) => {
  switch (action.type) {
    case TxActionType.TokenApprove:
      if (action.clears) {
        return "Revoke from";
      }
      return "Approve to";
    case TxActionType.ContractInteraction:
      return "Contract address";
    default:
      return "Recipient";
  }
};

const getRecipientAddress = (action: TxAction) => {
  if (
    action.type === TxActionType.TokenTransfer ||
    action.type === TxActionType.TokenApprove
  ) {
    return action.toAddress;
  }
  if (action.type === TxActionType.ContractInteraction) {
    return action.contractAddress;
  }
  return null;
};

type TokensProps = {
  accountAddress: string;
  action: TxAction;
};

const Tokens: FC<TokensProps> = ({ accountAddress, action }) => {
  const currentNetwork = useLazyNetwork();
  const explorerLink = useExplorerLink(currentNetwork);
  const tokens = useMemo(() => getTokens(action), [action]);

  if (!tokens) {
    return null;
  }

  return (
    <InfoRaw label={tokens.length > 1 ? "Tokens" : "Token"}>
      {typeof tokens === "string" ? (
        <div className="flex items-center">
          <TippySingletonProvider>
            <HashPreview hash={tokens} className="text-sm" />
            {explorerLink && (
              <IconedButton
                href={explorerLink.address(tokens)}
                aria-label="View in Explorer"
                Icon={WalletExplorerIcon}
                className="!w-6 !h-6 ml-2"
                iconClassName="!w-[1.125rem]"
              />
            )}
          </TippySingletonProvider>
        </div>
      ) : (
        <div className="flex flex-col min-w-0">
          {tokens.map((token, i) => (
            <TokenAmount
              key={token.slug}
              accountAddress={accountAddress}
              token={token}
              className={classNames(i !== tokens.length - 1 && "mb-2")}
            />
          ))}
        </div>
      )}
    </InfoRaw>
  );
};

const getTokens = (action: TxAction) => {
  if (action.type === TxActionType.TokenTransfer) {
    return action.tokens;
  }
  if (action.type === TxActionType.TokenApprove) {
    if (action.tokenSlug && (action.amount !== undefined || action.clears)) {
      return [
        {
          slug: action.tokenSlug,
          amount: action.clears ? undefined : action.amount,
        },
      ];
    }
    if (action.allTokensContract) {
      return action.allTokensContract;
    }
  }
  if (
    action.type === TxActionType.ContractInteraction &&
    action.nativeTokenAmount &&
    BigInt(action.nativeTokenAmount) > 0n
  ) {
    return [
      {
        slug: NATIVE_TOKEN_SLUG,
        amount: action.nativeTokenAmount,
      },
    ];
  }
  return null;
};

type InfoRawProps = PropsWithChildren<{
  flexAlignPosition?: string;
  label: string;
}>;

const InfoRaw: FC<InfoRawProps> = ({
  label,
  flexAlignPosition = "items-start",
  children,
}) => (
  <div
    className={`py-3 pl-4 flex ${flexAlignPosition} items-start justify-between`}
  >
    <h3 className="text-sm mr-5">{label}</h3>
    {children}
  </div>
);
