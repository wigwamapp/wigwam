import { type FC, useEffect, useCallback, useMemo } from "react";
import events from "events";
import { useAtom, useAtomValue } from "jotai";
import { type TransakConfig, TransakEvents } from "core/types/transak";
import { generateURL, makeHandleMessage } from "app/utils/transak";
import { onRampModalAtom, tokenSlugAtom } from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import { ReactComponent as ProcessingIcon } from "app/icons/onramp-tx-pending.svg";
import { nanoid } from "nanoid";
import {
  AccountAsset,
  ActivityType,
  RampActivity,
  SelfActivityKind,
} from "core/types";
import * as repo from "core/repo";
import { useAccountToken } from "app/hooks";

const addRampActivity = (rampActivity: any) => {
  const activity: RampActivity = {
    ...rampActivity,
    id: nanoid(),
    type: ActivityType.Ramp,
    partnerOrderId: rampActivity.id,
    pending: 1,
    timeAt: new Date(rampActivity.createdAt).getTime(),
    totalFee: rampActivity.totalFeeInFiat,
    amountInCrypto: rampActivity.cryptoAmount,
    amountInFiat: rampActivity.fiatAmount,
    amountInFiatUSD: rampActivity.fiatAmountInUsd,
    tokenSlug: rampActivity.tokenSlug,
    chainId: rampActivity.chainId,
    accountAddress: rampActivity.walletAddress,
    withError: false,

    source: {
      type: "self",
      kind: SelfActivityKind.Transfer,
    },
  };

  repo.activities.put(activity);
};

const OnRampIframe: FC<{ config: TransakConfig }> = ({ config }) => {
  const { alert } = useDialog();
  const [, setOnRampModalOpened] = useAtom(onRampModalAtom);
  const iframeUrl = useMemo(() => generateURL(config), [config]);
  const eventEmitter = useMemo(() => new events.EventEmitter(), []);
  const tokenSlug = useAtomValue(tokenSlugAtom)!;
  const tokenInfo = useAccountToken(tokenSlug) as AccountAsset | undefined;

  const handleSuccessOrder = useCallback(
    (payload: any) => {
      addRampActivity({
        ...payload.status,
        tokenSlug,
        chainId: tokenInfo?.chainId,
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
    [tokenInfo?.chainId, tokenSlug, setOnRampModalOpened, alert],
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
      className="h-full pt-10 pb-5 flex justify-center rounded-[2rem]"
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
