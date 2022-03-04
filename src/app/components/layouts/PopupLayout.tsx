import { FC } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { WalletStatus } from "core/types";

import { openInTab } from "app/helpers";
import { walletStatusAtom } from "app/atoms";
import ActivityBar from "app/components/blocks/ActivityBar";
import RoundedButton from "app/components/elements/RoundedButton";
import LockProfileButton from "app/components/elements/LockProfileButton";
import { ReactComponent as FullScreenIcon } from "app/icons/full-screen.svg";

type PopupLayoutProps = {
  className?: string;
};

const PopupLayout: FC<PopupLayoutProps> = ({ className, children }) => {
  const walletStatus = useAtomValue(walletStatusAtom);

  const isUnlocked = walletStatus === WalletStatus.Unlocked;

  return (
    <div
      className={classNames(
        "w-full",
        "flex flex-col items-stretch",
        "h-screen"
      )}
    >
      <div className="flex px-3 pt-3">
        {isUnlocked && <LockProfileButton />}

        <RoundedButton
          theme={isUnlocked ? "small" : "large"}
          onClick={() => openInTab()}
          className={classNames(
            "w-full",
            "ml-2",
            !isUnlocked && "p-3.5",
            isUnlocked && "p-3"
          )}
        >
          <FullScreenIcon className="mr-1" />
          Open Full
        </RoundedButton>
      </div>

      <main
        className={classNames(
          "relative",
          "flex-1",
          "pt-3 px-3",
          "overflow-hidden",
          "flex flex-col",
          className
        )}
      >
        {children}
      </main>
      {isUnlocked && <ActivityBar theme="small" />}
    </div>
  );
};

export default PopupLayout;
