import { FC } from "react";
import classNames from "clsx";
import { openInTab } from "app/helpers";
import DesktopComputerIcon from "@heroicons/react/outline/DesktopComputerIcon";

const PopupLayout: FC = ({ children }) => (
  <div className={classNames("w-full min-h-screen", "flex flex-col")}>
    <button
      className={classNames(
        "w-full p-8",
        "flex items-center justify-center",
        "text-xl font-medium",
        "border-b border-white border-opacity-10"
      )}
      onClick={() => openInTab()}
    >
      <DesktopComputerIcon className="h-6 w-auto mr-4 stroke-current" />
      Open Wallet
    </button>

    <main className="flex-1 overflow-y-auto">{children}</main>
  </div>
);

export default PopupLayout;
