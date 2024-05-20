import { FC, useCallback } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { replaceT } from "lib/ext/i18n";
import { isPopup as isPopupPrimitive } from "lib/ext/view";

import { lockWallet } from "core/client";

import { useDialog } from "app/hooks/dialog";
import { approvalsAtom, currentProfileAtom } from "app/atoms";
import Button from "app/components/elements/Button";
import RoundedButton from "app/components/elements/RoundedButton";
import AutoIcon from "./AutoIcon";

type LockProfileButtonProps = {
  className?: string;
};

const LockProfileButton: FC<LockProfileButtonProps> = ({ className }) => {
  const currentProfile = useAtomValue(currentProfileAtom);
  const approvals = useAtomValue(approvalsAtom);
  const { confirm } = useDialog();

  const isPopup = isPopupPrimitive();

  const handleLock = useCallback(async () => {
    try {
      const approvalsAmount = approvals.length;
      const response =
        approvalsAmount === 0
          ? true
          : await confirm({
              title: "Lock",
              content: (
                <p
                  className={classNames(
                    !isPopup && "mb-4",
                    isPopup && "mb-2",
                    "mx-auto text-center",
                  )}
                >
                  Are you sure you want to lock the wallet? You have{" "}
                  {approvalsAmount} request{approvalsAmount > 1 ? "s" : ""}{" "}
                  waiting for approvals. If you lock the wallet now, all
                  requests will be cleared!
                </p>
              ),
              yesButtonText: "Lock",
            });

      if (response) {
        await lockWallet();
      }
    } catch (err) {
      console.error(err);
    }
  }, [approvals.length, confirm, isPopup]);

  const content = (
    <>
      <AutoIcon
        seed={currentProfile.avatarSeed}
        source="boring"
        variant="marble"
        autoColors
        initialsSource={replaceT(currentProfile.name)}
        initialsScale={0.5}
        className={classNames(
          !isPopup && "w-[1.875rem] h-[1.875rem]",
          isPopup && "w-8 h-8",
          "mr-3",
        )}
      />
      Lock
    </>
  );

  if (isPopup) {
    return (
      <RoundedButton
        onClick={handleLock}
        className={classNames("pl-3 pr-4", className)}
      >
        {content}
      </RoundedButton>
    );
  }

  return (
    <Button
      theme="secondary"
      onClick={handleLock}
      className={classNames(
        "h-full !py-2 !px-4 !min-w-0 w-[8.5rem]",
        "!rounded-[.625rem]",
        "!justify-start items-center",
        className,
      )}
    >
      {content}
    </Button>
  );
};

export default LockProfileButton;
