import { FC, memo, useCallback, useEffect, useMemo, useRef } from "react";
import classNames from "clsx";
import * as Dialog from "@radix-ui/react-dialog";
import { useAtom, useAtomValue } from "jotai";
import { useIsMounted } from "lib/react-hooks/useIsMounted";

import {
  onRampCurrenciesAtom,
  onRampCurrencyCodeAtom,
  onRampModalAtom,
  selectedCurrencyAtom,
} from "app/atoms";
import { useDialog } from "app/hooks/dialog";
import Button from "app/components/elements/Button";
import { ReactComponent as WigwamIcon } from "app/icons/Wigwam.svg";
import OnRampIframe from "./OnRampIframe";
import { Environments, TransakConfig } from "core/types/transak";
import { useAccounts } from "app/hooks";

const AddFundsOnRampModal = memo(() => {
  const [onRampModalOpened, setOnRampModalOpened] = useAtom(onRampModalAtom);
  const onRampCurrencies = useAtomValue(onRampCurrenciesAtom);
  const [selectedCurrency] = useAtom(selectedCurrencyAtom);
  const currencyCode = useAtomValue(onRampCurrencyCodeAtom);
  const {
    currentAccount: { address },
  } = useAccounts();
  const { confirm } = useDialog();
  const isMounted = useIsMounted();
  const contentRenderedRef = useRef(false);

  const rampCurrencyInfo = useMemo(() => {
    if (currencyCode && currencyCode in onRampCurrencies) {
      return onRampCurrencies[currencyCode];
    }
    return null;
  }, [onRampCurrencies, currencyCode]);

  const bootAnimationDisplayed = useMemo(
    () => onRampModalOpened && isMounted() && !contentRenderedRef.current,
    [isMounted, onRampModalOpened],
  );

  const isCurrentUserCcyCrypto = useMemo(
    () => ["BTC", "USD"].includes(selectedCurrency),
    [selectedCurrency],
  );

  const config: TransakConfig = useMemo(
    () => ({
      apiKey: process.env.WIGWAM_ON_RAMP_API_KEY!,
      environment:
        process.env.NODE_ENV === "development"
          ? Environments.STAGING
          : Environments.PRODUCTION,
      defaultFiatCurrency: !isCurrentUserCcyCrypto ? selectedCurrency : "USD",
      defaultNetwork: rampCurrencyInfo?.network,
      productsAvailed: "BUY",
      cryptoCurrencyCode: rampCurrencyInfo?.symbol,
      walletAddress: address,
      disableWalletAddressForm: true,
      themeColor: "#0D1311",
      exchangeScreenTitle: `Securely buy ${selectedCurrency} with Wigwam`,
      networks: [
        "ethereum",
        "polygon",
        "avaxcchain",
        "bnb",
        "fantom",
        "bsc",
        "celo",
        "arbitrum",
        "fuse",
        "moonriver",
        "optimism",
        "base",
        "linea",
      ],
    }),
    [
      address,
      isCurrentUserCcyCrypto,
      rampCurrencyInfo?.network,
      rampCurrencyInfo?.symbol,
      selectedCurrency,
    ],
  );

  console.log("🚀 ~ AddFundsOnRampModal ~ config:", config);

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      const res = await confirm({
        title: "Cancel funding operation",
        content: (
          <p className="mb-4 mx-auto text-center">
            Are you sure you want to cancel? Exiting now will result in the loss
            of all previously entered information. Confirm cancellation?
          </p>
        ),
        noButtonText: "Stay",
        yesButtonText: "Cancel",
        buttonTheme: {
          primary: "secondary",
          secondary: "primary",
        },
      });

      if (!res) {
        return;
      }
      setOnRampModalOpened([open]);
    },
    [confirm, setOnRampModalOpened],
  );

  const handleContentMount = useCallback((mounted: boolean) => {
    contentRenderedRef.current = mounted;
  }, []);

  return (
    <Dialog.Root open={onRampModalOpened} onOpenChange={handleOpenChange} modal>
      <Dialog.Portal>
        <Dialog.Overlay
          className={classNames("fixed inset-0 z-20", "bg-brand-darkblue/50")}
        />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={classNames(
            "fixed z-20",
            "w-full max-w-6xl min-w-[40rem]",
            "max-h-[41rem]",
            "m-auto inset-x-0 inset-y-[3.5rem]",
            "rounded-[2.5rem]",
            "brandbg-large-modal",
            bootAnimationDisplayed && "animate-modalcontent",
          )}
        >
          <OnMount handle={handleContentMount} />

          <WigwamIcon
            className={classNames(
              "w-16 h-auto",
              "absolute",
              "top-0 left-1/2",
              "-translate-x-1/2 -translate-y-1/4",
              "z-30",
            )}
          />

          <Dialog.Close className="absolute top-6 right-8" asChild>
            <Button theme="clean">Cancel</Button>
          </Dialog.Close>

          {onRampModalOpened && (
            <div className="h-full">
              <OnRampIframe config={config} />
            </div>
          )}

          <div
            className={classNames(
              "absolute inset-0",
              "shadow-addaccountmodal",
              "rounded-[2.5rem]",
              "pointer-events-none",
              "z-20",
            )}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

export default AddFundsOnRampModal;

const OnMount: FC<{ handle: (mounted: boolean) => void }> = ({ handle }) => {
  useEffect(() => {
    handle(true);
    return () => handle(false);
  }, [handle]);

  return null;
};
