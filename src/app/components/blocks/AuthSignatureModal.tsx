import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useLazyAtomValue } from "lib/atom-utils";
import { storage } from "lib/ext/storage";

import { Setting } from "core/common";

import { useAccounts, useProvider } from "app/hooks";
import { withHumanDelay } from "app/utils";
import { requiredAuthSigAtom } from "app/atoms";

import SecondaryModal from "app/components/elements/SecondaryModal";
import Button from "app/components/elements/Button";

const AuthSignatureModal: FC = () => {
  const { allAccounts } = useAccounts();
  let addressesToSign = useLazyAtomValue(requiredAuthSigAtom);
  const provider = useProvider();

  const [modalOpened, setModalOpened] = useState(false);

  addressesToSign = useMemo(
    () =>
      addressesToSign?.filter((a) =>
        allAccounts.find((acc) => acc.address === a),
      ),
    [addressesToSign, allAccounts],
  );

  useEffect(() => {
    if (!modalOpened && addressesToSign?.length) {
      const t = setTimeout(() => setModalOpened(true), 1_000);
      return () => clearTimeout(t);
    }

    return;
  }, [addressesToSign, setModalOpened, modalOpened]);

  const handleSign = useCallback(
    async () =>
      withHumanDelay(async () => {
        if (!addressesToSign?.length) {
          setModalOpened(false);
          return;
        }

        const authMessage = await fetch(
          `${process.env.WIGWAM_INDEXER_API}/auth-message`,
        ).then((r) => r.text());

        const results = await Promise.all(
          addressesToSign.map(async (address) => {
            try {
              const sig = await provider
                .getUncheckedSigner(address)
                .signMessage(
                  authMessage.replace(/{address}/g, ethers.getAddress(address)),
                );

              await storage.put(`authsig_${address}`, sig);
              return true;
            } catch (err) {
              console.error(err);
              return false;
            }
          }),
        );

        await storage.put(
          Setting.RequiredAuthSig,
          addressesToSign.filter((_, i) => !results[i]),
        );

        setModalOpened(false);
      }),
    [provider, addressesToSign, setModalOpened],
  );

  if (!modalOpened) {
    return null;
  }

  return (
    <SecondaryModal
      open={modalOpened}
      onOpenChange={() => setModalOpened(false)}
      disabledClickOutside
      closeButton={false}
      header={"Required auth signature"}
      className="max-w-[43.75rem]"
      headerClassName="!text-[2rem] !mb-6"
    >
      <div className="w-full py-8 flex items-center justify-center">
        <Button onClick={handleSign}>Add auth signature</Button>
      </div>
    </SecondaryModal>
  );
};

export default AuthSignatureModal;
