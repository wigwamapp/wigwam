import { FC } from "react";
import { useAtomValue } from "jotai";

import { useIsSyncing } from "app/hooks";
import { Page, SettingTab } from "app/nav";
import Button from "app/components/elements/Button";
import NetworkSelect from "app/components/elements/NetworkSelect";
import LockProfileButton from "app/components/elements/LockProfileButton";
import { ReactComponent as ControlIcon } from "app/icons/control.svg";
import { pageAtom } from "app/atoms";

const Menu: FC = () => {
  const isSyncing = useIsSyncing();
  const page = useAtomValue(pageAtom);

  return (
    <div className="flex items-center py-4 border-b border-brand-main/[.07]">
      {page !== Page.Swap && (
        <NetworkSelect
          className="w-[17.75rem]"
          contentClassName="w-[17.75rem]"
        />
      )}

      {isSyncing && (
        <span className="px-4 text-sm text-white font-semibold">
          Syncing...
        </span>
      )}

      <div className="ml-auto flex items-center">
        <Button
          to={{ page: Page.Settings, setting: SettingTab.General }}
          theme="tertiary"
          className="!min-w-0 w-[8.5rem]"
        >
          <ControlIcon className="w-6 h-auto -ml-0.5 mr-2" />
          Control
        </Button>
        <span className="mx-6 h-7 w-0.5 bg-brand-main/[.05]" />
        <LockProfileButton />
      </div>
    </div>
  );
};

export default Menu;
