import { FC, useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import classNames from "clsx";
import { replaceT } from "lib/ext/i18n";

import { lockWallet } from "core/client";

import { allNetworksAtom, chainIdAtom, currentProfileAtom } from "app/atoms";
import { useLazyNetwork } from "app/hooks";
import NetworkSelectPrimitive from "app/components/elements/NetworkSelect";
import NewButton from "app/components/elements/NewButton";
import AutoIcon from "app/components/elements/AutoIcon";
import { ReactComponent as ControlIcon } from "app/icons/control.svg";

const Menu: FC = () => {
  return (
    <div className="flex items-center py-4 border-b border-brand-main/[.07]">
      <NetworkSelect />
      <div className="ml-auto flex items-center">
        <NewButton theme="tertiary" className="!min-w-0 w-[8.5rem]">
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

type NetworkSelectProps = {
  className?: string;
};

const NetworkSelect: FC<NetworkSelectProps> = ({ className }) => {
  const networks = useAtomValue(allNetworksAtom);
  const currentNetwork = useLazyNetwork(networks[0]);

  const setChainId = useSetAtom(chainIdAtom);

  return (
    <NetworkSelectPrimitive
      networks={networks}
      currentNetwork={currentNetwork}
      onNetworkChange={setChainId}
      className={className}
    />
  );
};

const LockProfileButton: FC = () => {
  const currentProfile = useAtomValue(currentProfileAtom);

  const handleLock = useCallback(async () => {
    try {
      await lockWallet();
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <NewButton
      theme="secondary"
      className={classNames(
        "h-full !py-2 !px-4 !min-w-0 w-[8.5rem]",
        "!rounded-[.625rem]",
        "!justify-start items-center"
      )}
      onClick={handleLock}
    >
      <AutoIcon
        seed={currentProfile.avatarSeed}
        source="boring"
        variant="marble"
        autoColors
        initialsSource={replaceT(currentProfile.name)}
        className={classNames("w-[1.875rem] h-[1.875rem]", "mr-3")}
      />
      Lock
    </NewButton>
  );
};
