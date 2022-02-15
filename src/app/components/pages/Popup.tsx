import { FC, useCallback } from "react";
import { useAtomValue } from "jotai";

import { lockWallet } from "core/client";

import { activeTabAtom } from "app/atoms";
import PopupLayout from "app/components/layouts/PopupLayout";

const Popup: FC = () => {
  return (
    <PopupLayout>
      <LockWallet />

      <ActiveTab />
    </PopupLayout>
  );
};

export default Popup;

const LockWallet: FC = () => {
  const handleLock = useCallback(async () => {
    try {
      await lockWallet();
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className="w-full flex items-center">
      <div className="flex-1" />

      <button
        className="px-4 py-2 underline hover:text-red-700 text-sm"
        onClick={handleLock}
      >
        Lock
      </button>
    </div>
  );
};

const ActiveTab: FC = () => {
  const activeTab = useAtomValue(activeTabAtom);

  return (
    <>
      {activeTab && (
        <div className="flex flex-col p-4 w-full overflow-x-auto">
          URL: {activeTab.url}
          Title: {activeTab.title}
        </div>
      )}
    </>
  );
};
