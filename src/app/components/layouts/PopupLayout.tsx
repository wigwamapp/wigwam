import { FC } from "react";
import classNames from "clsx";

import { openInTab } from "app/helpers";
import { ReactComponent as FullScreenIcon } from "app/icons/full-screen.svg";
import { ReactComponent as BackgroundIcon } from "app/icons/button-full-screen-background.svg";

const PopupLayout: FC = ({ children }) => (
  <div className={classNames("w-full min-h-screen p-3", "flex flex-col")}>
    <button
      className={classNames(
        "relative",
        "w-full p-4",
        "flex items-center justify-center",
        "text-lg font-bold",
        "group"
      )}
      onClick={() => openInTab()}
    >
      <FullScreenIcon className="mr-1" />
      Open Full
      <BackgroundIcon
        className={classNames(
          "absolute top-0 left-0 w-full h-full",
          "bg-opacity-10",
          "group-hover:bg-opacity-20",
          "glass-icon"
        )}
      />
    </button>

    <main className="flex-1 overflow-y-auto">{children}</main>
  </div>
);

export default PopupLayout;
