import { FC, useCallback, useEffect, useState } from "react";
import { useLazyAtomValue } from "lib/atom-utils";
import { storage } from "lib/ext/storage";

import { Setting } from "core/common";

import { useProvider } from "app/hooks";
import { requiredAuthSigAtom } from "app/atoms";
import { withHumanDelay } from "app/utils";

import SecondaryModal from "app/components/elements/SecondaryModal";
import Button from "app/components/elements/Button";
import { ethers } from "ethers";

const AuthSignatureModal: FC = () => {
  const addressesToSign = useLazyAtomValue(requiredAuthSigAtom);
  const provider = useProvider();

  const [modalOpened, setModalOpened] = useState(false);

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
          `${process.env.VIGVAM_INDEXER_API}/auth-message`,
        ).then((r) => r.text());

        const results = await Promise.all(
          addressesToSign.map(async (address) => {
            try {
              const sig = await provider
                .getSigner(address)
                .then((s) =>
                  s.signMessage(
                    authMessage.replace(
                      /{address}/g,
                      ethers.getAddress(address),
                    ),
                  ),
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
