import { FC } from "react";

import { useIsSyncing } from "app/hooks";
import NewButton from "app/components/elements/NewButton";
import NetworkSelect from "app/components/elements/NetworkSelect";
import LockProfileButton from "app/components/elements/LockProfileButton";
import { ReactComponent as ControlIcon } from "app/icons/control.svg";

const Menu: FC = () => {
  const isSyncing = useIsSyncing();

  return (
    <div className="flex items-center py-4 border-b border-brand-main/[.07]">
      <NetworkSelect />

      {isSyncing && (
        <span className="px-4 text-sm text-white font-semibold">
          Syncing...
        </span>
      )}

      <div className="ml-auto flex items-center">
        <NewButton theme="tertiary" className="!min-w-0 w-[8.5rem]">
          <ControlIcon className="w-6 h-auto -ml-0.5 mr-2" />
          Control
        </NewButton>
        <span className="mx-6 h-7 w-0.5 bg-brand-main/[.05]" />
        <LockProfileButton />
      </div>
    </div>
  );
};

export default Menu;
