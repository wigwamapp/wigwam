import { FC, useCallback } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";
import { replaceT } from "lib/ext/i18n";
import { isPopup as isPopupPrimitive } from "lib/ext/view";

import { lockWallet } from "core/client";

import { currentProfileAtom } from "app/atoms";
import NewButton from "app/components/elements/NewButton";
import AutoIcon from "app/components/elements/AutoIcon";
import RoundedButton from "app/components/elements/RoundedButton";

type LockProfileButtonProps = {
  className?: string;
};

const LockProfileButton: FC<LockProfileButtonProps> = ({ className }) => {
  const currentProfile = useAtomValue(currentProfileAtom);

  const handleLock = useCallback(async () => {
    try {
      await lockWallet();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const isPopup = isPopupPrimitive();

  const content = (
    <>
      <AutoIcon
        seed={currentProfile.avatarSeed}
        source="boring"
        variant="marble"
        autoColors
        initialsSource={replaceT(currentProfile.name)}
        className={classNames(
          !isPopup && "w-[1.875rem] h-[1.875rem]",
          isPopup && "w-8 h-8",
          "mr-3"
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
    <NewButton
      theme="secondary"
      onClick={handleLock}
      className={classNames(
        "h-full !py-2 !px-4 !min-w-0 w-[8.5rem]",
        "!rounded-[.625rem]",
        "!justify-start items-center",
        className
      )}
    >
      {content}
    </NewButton>
  );
};

export default LockProfileButton;
