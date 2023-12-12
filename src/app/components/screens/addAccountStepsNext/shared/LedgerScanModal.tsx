import { ComponentProps, FC, useEffect, useState } from "react";

import { useLedger } from "app/hooks/ledger";
import { useDialog } from "app/hooks/dialog";
import { useSteps } from "app/hooks/steps";

import ScanAccountsModal from "./ScanAccountsModal";

const LedgerScanModal: FC<ComponentProps<typeof ScanAccountsModal>> = ({
  onOpenChange,
  ...rest
}) => {
  const withLedger = useLedger();
  const { stateRef } = useSteps();
  const { alert } = useDialog();

  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const derivationPath = "m/44'/60'/0'/0";
        let extendedKey: string | undefined;

        const answer = await withLedger(
          async ({ ledgerEth, getExtendedKey }) => {
            const { publicKey, chainCode } = await ledgerEth.getAddress(
              derivationPath,
              false,
              true,
            );
            extendedKey = getExtendedKey(publicKey, chainCode!);
          },
        );

        stateRef.current.derivationPath = derivationPath;
        stateRef.current.extendedKey = extendedKey;

        if (answer) {
          setScanning(true);
        } else {
          onOpenChange?.(false);
        }
      } catch (err: any) {
        alert({ title: "Error", content: err?.message });
      }
    })();
  }, [withLedger, stateRef, setScanning, alert, onOpenChange]);

  return (
    <>
      {scanning && (
        <ScanAccountsModal onOpenChange={() => setScanning(false)} {...rest} />
      )}
    </>
  );
};

export default LedgerScanModal;
