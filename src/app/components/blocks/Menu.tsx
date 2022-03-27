import { FC } from "react";

import { useIsSyncing } from "app/hooks";
import { useWarning } from "app/hooks/warning";
import NewButton from "app/components/elements/NewButton";
import NetworkSelect from "app/components/elements/NetworkSelect";
import LockProfileButton from "app/components/elements/LockProfileButton";
import { ReactComponent as ControlIcon } from "app/icons/control.svg";

const Menu: FC = () => {
  const isSyncing = useIsSyncing();

  const { setModalData } = useWarning();

  const handleButtonClick = () => {
    setModalData({
      header: "Test",
      children:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam," +
        " purus sit amet luctus venenatis, lectus magna fringilla urna," +
        " porttitor rhoncus dolor purus non enim praesent elementum facilisis leo",
      primaryButtonText: "Yes, continue!",
      secondaryButtonText: "No, I'm not sure",
    });
  };

  return (
    <div className="flex items-center py-4 border-b border-brand-main/[.07]">
      <NetworkSelect />

      {isSyncing && (
        <span className="px-4 text-sm text-white font-semibold">
          Syncing...
        </span>
      )}

      <div className="ml-auto flex items-center">
        <NewButton
          theme="tertiary"
          className="!min-w-0 w-[8.5rem]"
          onClick={handleButtonClick}
        >
          <ControlIcon className="-ml-0.5 mr-2" />
          Control
        </NewButton>
        <span className="mx-6 h-7 w-0.5 bg-brand-main/[.05]" />
        <LockProfileButton />
      </div>
    </div>
  );
};

export default Menu;
