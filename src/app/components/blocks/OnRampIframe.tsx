import { type FC, useEffect, useCallback, useMemo } from "react";
import { Emitter } from "lib/emitter";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  type TransakConfig,
  TransakEvents,
  Environments,
} from "core/types/transak";
import { generateURL, makeHandleMessage } from "app/utils/transak";
import {
  onRampModalAtom,
  selectedCurrencyAtom,
  tokenSlugAtom,
} from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { ReactComponent as ProcessingIcon } from "app/icons/onramp-tx-pending.svg";
import { nanoid } from "nanoid";
import { ActivityType, RampActivity, SelfActivityKind } from "core/types";
import * as repo from "core/repo";
import { useAccounts, useChainId, useRamp } from "app/hooks";

type RampOrder = { [key: string]: any };

const saveRampActivity = (rampOrder: RampOrder) => {
  const newRampActivity: RampActivity = {
    id: nanoid(),
    type: ActivityType.Ramp,
    partnerOrderId: rampOrder.id,
    timeAt: new Date(rampOrder.createdAt).getTime(),
    totalFee: rampOrder.totalFeeInFiat,
    amountInCrypto: rampOrder.cryptoAmount,
    amountInFiat: rampOrder.fiatAmount,
    amountInFiatUSD: rampOrder.fiatAmountInUsd,
    tokenSlug: rampOrder.tokenSlug,
    chainId: rampOrder.chainId,
    accountAddress: rampOrder.walletAddress,
    cryptoCurrency: rampOrder.cryptoCurrency,
    fiatCurrency: rampOrder.fiatCurrency,
    network: rampOrder.network,
    paymentType: rampOrder.paymentOptionId,
    status: rampOrder.status,
    statusReason: rampOrder.statusReason,
    partnerOrder: rampOrder,
    pending: 1,
    partner: "transak",
    kind: "onramp",
    withError: false,
    source: {
      type: "self",
      kind: SelfActivityKind.Transfer,
    },
  };

  repo.activities.put(newRampActivity);
};

const OnRampIframe: FC = () => {
  const chainId = useChainId();
  const { alert } = useDialog();
  const { onRampCurrency } = useRamp();
  const eventEmitter = useMemo(() => new Emitter(), []);
  const [selectedCurrency] = useAtom(selectedCurrencyAtom);
  const setOnRampModalOpened = useSetAtom(onRampModalAtom);
  const tokenSlug = useAtomValue(tokenSlugAtom);

  const {
    currentAccount: { address },
  } = useAccounts();

  const isCurrentUserCcyCrypto = useMemo(
    () => ["BTC", "USD"].includes(selectedCurrency),
    [selectedCurrency],
  );

  if (!process.env.WIGWAM_ON_RAMP_API_KEY) {
    setOnRampModalOpened([false]);
    alert({
      title: "Error",
      content: <p>Transak API Key is not provided!</p>,
    });
    console.error("[Error]: Transak API Key is not provided!");
  }

  const config: TransakConfig = useMemo(
    () => ({
      apiKey: process.env.WIGWAM_ON_RAMP_API_KEY!,
      environment:
        process.env.RELEASE_ENV !== "true"
          ? Environments.STAGING
          : Environments.PRODUCTION,
      defaultFiatCurrency: !isCurrentUserCcyCrypto ? selectedCurrency : "USD",
      network: onRampCurrency?.network,
      productsAvailed: "BUY",
      cryptoCurrencyCode: onRampCurrency?.symbol,
      walletAddress: address,
      disableWalletAddressForm: true,
      themeColor: "#0D1311",
      exchangeScreenTitle: `Securely buy ${onRampCurrency?.symbol} with Wigwam`,
    }),
    [
      address,
      isCurrentUserCcyCrypto,
      onRampCurrency?.network,
      onRampCurrency?.symbol,
      selectedCurrency,
    ],
  );

  const iframeUrl = useMemo(() => generateURL(config), [config]);

  const handleSuccessOrder = useCallback(
    (payload: { [key: string]: any }) => {
      saveRampActivity({
        ...payload.status,
        tokenSlug,
        chainId,
      });
      setOnRampModalOpened([false]);
      alert({
        title: (
          <div className="flex items-center gap-2">
            <ProcessingIcon className="w-8" /> Transaction Processing
          </div>
        ),
        content: (
          <p>
            Great news! We&apos;re processing your credit card transaction for
            cryptocurrency. It won&apos;t be long now.
          </p>
        ),
      });
    },
    [chainId, tokenSlug, setOnRampModalOpened, alert],
  );

  const handleCloseIframe = useCallback(() => {
    eventEmitter.removeAllListeners();
    window.removeEventListener(
      "message",
      makeHandleMessage(eventEmitter, handleCloseIframe),
    );
    eventEmitter.off(
      TransakEvents.TRANSAK_ORDER_SUCCESSFUL,
      handleSuccessOrder,
    );
  }, [eventEmitter, handleSuccessOrder]);

  const handleOpenIframe = useCallback(() => {
    window.addEventListener(
      "message",
      makeHandleMessage(eventEmitter, handleCloseIframe),
    );

    eventEmitter.on(TransakEvents.TRANSAK_ORDER_SUCCESSFUL, handleSuccessOrder);
  }, [eventEmitter, handleCloseIframe, handleSuccessOrder]);

  useEffect(() => {
    handleOpenIframe();

    return () => handleCloseIframe();
  }, [handleCloseIframe, handleOpenIframe, iframeUrl]);

  return (
    <div
      className="h-full pt-16 pb-12 flex justify-center rounded-[2rem]"
      id="transakPanel"
    >
      <iframe
        id="transakIframe"
        title="transak"
        src={iframeUrl}
        allow="camera;microphone;payment"
        className="rounded-3xl h-full pt-2 mt-2 w-[26rem] border-none"
      />
    </div>
  );
};

export default OnRampIframe;
