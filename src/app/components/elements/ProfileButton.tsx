import { FC, useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import classNames from "clsx";
import Fuse from "fuse.js";
import { isPopup as isPopupPrimitive } from "lib/ext/view";
import { replaceT, useI18NUpdate } from "lib/ext/react";
import { useLazyAtomValue } from "lib/atom-utils";

import { Account } from "core/types";
import { lockWallet } from "core/client";

import { ACCOUNTS_SEARCH_OPTIONS } from "app/defaults";
import {
  profileStateAtom,
  approvalsAtom,
  accountAddressAtom,
  addAccountModalAtom,
  updateAvailableAtom,
} from "app/atoms";
import { Page } from "app/nav";
import { openInTab } from "app/helpers";
import { useAccounts } from "app/hooks";
import { useDialog } from "app/hooks/dialog";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as ManageWalletIcon } from "app/icons/manage-wallets.svg";
import { ReactComponent as NoResultsFoundIcon } from "app/icons/no-results-found.svg";
import { ReactComponent as LockIcon } from "app/icons/lock.svg";
import { ReactComponent as GearIcon } from "app/icons/settings-gear.svg";
import { ReactComponent as ExpandIcon } from "app/icons/expand.svg";

import WalletName from "./WalletName";
import HashPreview from "./HashPreview";
import CopiableTooltip from "./CopiableTooltip";
import SecondaryModal, { SecondaryModalProps } from "./SecondaryModal";
import SearchInput from "./SearchInput";
import Button from "./Button";
import ScrollAreaContainer from "./ScrollAreaContainer";
import TooltipIcon from "./TooltipIcon";
import Tooltip from "./Tooltip";
import IconedButton from "./IconedButton";
import TotalWalletBalance from "./TotalWalletBalance";
import AutoIcon from "./AutoIcon";
import WalletAvatar from "./WalletAvatar";

type Size = "small" | "large";

type ProfileButtonProps = {
  className?: string;
  size?: Size;
  hideAddress?: boolean;
};

const ProfileButton: FC<ProfileButtonProps> = ({
  className,
  size = "large",
  hideAddress,
}) => {
  const { currentAccount } = useAccounts();
  const addAccountModalOpened = useAtomValue(addAccountModalAtom);
  const updateAvailable = useAtomValue(updateAvailableAtom);

  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    if (addAccountModalOpened) {
      setModalOpened(false);
    }
  }, [setModalOpened, addAccountModalOpened]);

  return (
    <>
      <div className={classNames("flex items-center gap-6", className)}>
        {hideAddress ? null : (
          <AddressButton address={currentAccount.address} />
        )}
        <button
          type="button"
          onClick={() => setModalOpened(true)}
          className={classNames(
            "relative",
            "flex items-center gap-3",
            "max-w-full",
            size === "large" ? "py-2 pr-2 pl-4" : "py-1 pl-2 pr-1",
            size === "large" ? "rounded-xl" : "rounded-md",
            "transition-colors",
            size === "large"
              ? "hover:bg-brand-main/5 focus-visible:bg-brand-main/5"
              : "hover:bg-white/[.16] focus-visible:bg-white/[.16]",
          )}
        >
          <WalletName
            wallet={currentAccount}
            className={classNames(
              "mb-0.5 font-bold truncate min-w-0",
              size === "large" ? "text-base" : "text-sm",
            )}
          />
          <WalletAvatar
            seed={currentAccount.address}
            className={classNames(
              size === "large"
                ? "h-[3rem] w-[3rem] min-w-[3rem]"
                : "h-9 w-9 min-w-9",
              size === "large" ? "bg-black/40" : "bg-brand-darkbg",
              size === "large" ? "rounded-[.625rem]" : "rounded-md",
            )}
          />

          {size === "small" && updateAvailable ? (
            <div
              className={classNames(
                "w-2 h-2",
                "bg-activity rounded-full",
                "absolute top-0.5 right-0.5",
              )}
            />
          ) : null}
        </button>
      </div>
      <ProfilesModal
        open={modalOpened}
        onOpenChange={setModalOpened}
        size={size}
      />
    </>
  );
};

export default ProfileButton;

const AddressButton: FC<{ address: string }> = ({ address }) => {
  const [copied, setCopied] = useState(false);

  return (
    <CopiableTooltip
      content="Copy wallet address to clipboard"
      textToCopy={address}
      onCopiedToggle={setCopied}
      className={classNames(
        "text-left",
        "rounded-full",
        "max-w-full",
        "transition-colors",
        "flex items-center",
        "px-3 py-1.5",
        "bg-brand-main/5 hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
      )}
    >
      <>
        <HashPreview
          hash={address}
          withTooltip={false}
          className="text-base font-normal leading-none mr-1.5"
        />
        {copied ? (
          <SuccessIcon className="w-[1.5rem] h-auto" />
        ) : (
          <CopyIcon className="w-[1.5rem] h-auto" />
        )}
      </>
    </CopiableTooltip>
  );
};

const ProfilesModal: FC<SecondaryModalProps & { size?: Size }> = ({
  onOpenChange,
  size = "large",
  ...rest
}) => {
  const { all, currentId } = useAtomValue(profileStateAtom);
  const setAccountAddress = useSetAtom(accountAddressAtom);
  const updateAvailable = useAtomValue(updateAvailableAtom);
  useI18NUpdate();

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState<string | null>(null);

  const currentProfile = useMemo(
    () => all.find((profile) => profile.id === currentId)!,
    [all, currentId],
  );
  const currentName = replaceT(currentProfile.name);
  const currentSeed = currentProfile.avatarSeed;

  const { currentAccount, allAccounts } = useAccounts();

  const fuse = useMemo(
    () => new Fuse(allAccounts, ACCOUNTS_SEARCH_OPTIONS),
    [allAccounts],
  );

  const filteredAccounts = useMemo(() => {
    if (searchValue) {
      return fuse
        .search(searchValue)
        .map(({ item: account }) => account)
        .sort((a, b) =>
          a.address === currentAccount.address
            ? -1
            : a.name.localeCompare(b.name, undefined, { numeric: true }),
        );
    }
    return allAccounts.sort((a, b) =>
      a.address === currentAccount.address
        ? -1
        : a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  }, [allAccounts, currentAccount, fuse, searchValue]);

  const changeAccount = useCallback(
    (address: string) => {
      setAccountAddress(address);
      if (address !== currentAccount.address) onOpenChange?.(false);
    },
    [currentAccount, onOpenChange, setAccountAddress],
  );

  return (
    <SecondaryModal
      onOpenChange={onOpenChange}
      {...rest}
      className={classNames(
        "!p-0",
        size === "large" ? "!max-w-[27.5rem]" : "!max-w-[20.75rem]",
      )}
    >
      <div
        className={classNames(
          "w-full flex flex-col pt-5",
          size === "large" ? "px-5" : "px-4",
        )}
      >
        <div className="flex items-center text-xl font-bold gap-2 mr-auto mb-6">
          <AutoIcon
            seed={currentSeed}
            source="boring"
            variant="marble"
            autoColors
            initialsSource={currentName}
            className="w-8 h-8 text-5xl"
          />
          {currentName}
          <Tooltip
            content={
              <p>
                <strong>Profiles</strong> enables multiple separate sessions for
                varied needs like work and personal, boosting organization and
                privacy.
              </p>
            }
            size="large"
            placement={size === "small" ? "bottom" : undefined}
            interactive={false}
          >
            <TooltipIcon
              theme="light"
              className="w-5 h-5 mr-1.5 border border-brand-main/[.07]"
            />
          </Tooltip>
        </div>

        <div className="w-full flex items-center mb-3">
          <SearchInput
            searchValue={searchValue}
            toggleSearchValue={setSearchValue}
            placeholder="Search Wallets"
          />
          {size === "small" ? (
            <IconedButton
              aria-label="Manage wallets"
              to={{ page: Page.Wallets }}
              merge
              smartLink
              onClick={() => onOpenChange?.(false)}
              theme="secondary"
              Icon={ManageWalletIcon}
              className="ml-2 !w-10 min-w-[2.5rem] !h-10 rounded-lg"
              iconClassName="w-6 min-w-6 h-auto"
            />
          ) : (
            <Button
              to={{ page: Page.Wallets }}
              merge
              theme="secondary"
              onClick={() => onOpenChange?.(false)}
              className="ml-2 !py-2 !px-4 !min-w-max !max-h-11 w-auto"
            >
              <ManageWalletIcon className={classNames("h-6 w-auto mr-2")} />
              Manage wallets
            </Button>
          )}
        </div>

        {filteredAccounts.length > 0 ? (
          <ScrollAreaContainer
            ref={scrollAreaRef}
            className="w-full h-full box-content -mr-5 pr-5 grow "
            viewPortClassName="viewportBlock max-h-[16.25rem] pt-3 pb-5"
            viewPortStyle={{
              height: `${allAccounts.length * 4.5 + (allAccounts.length - 1) * 0.5 + 2}rem`,
            }}
            scrollBarClassName="pt-3 pb-5"
          >
            {filteredAccounts.map((account, index) => (
              <ProfileItem
                key={account.address}
                account={account}
                onClick={() => changeAccount(account.address)}
                isActive={currentAccount.address === account.address}
                size={size}
                className={index === filteredAccounts.length - 1 ? "" : "mb-2"}
              />
            ))}
          </ScrollAreaContainer>
        ) : (
          <div
            className={classNames(
              "flex justify-center items-center",
              "w-full max-h-[14.25rem]",
              "border border-brand-light/[.05]",
              "rounded-[.625rem]",
              "text-sm text-brand-placeholder",
              "mb-[1.25rem] mt-[.75rem]",
            )}
            style={{
              height: `${allAccounts.length * 4.5 + (allAccounts.length - 1) * 0.5}rem`,
            }}
          >
            <NoResultsFoundIcon className="mr-5" />
            No results found
          </div>
        )}
      </div>
      <div
        className={classNames(
          "w-full",
          "border-t border-brand-light/[.05]",
          "pt-3 pb-5",
          size === "large" ? "px-5" : "px-4",
          "flex items-center gap-3",
        )}
      >
        <LockButton />

        {size === "small" ? (
          <>
            <div className="relative flex items-center justfy-center">
              <IconedButton
                aria-label="Settings"
                to={{ page: Page.Settings }}
                smartLink
                onClick={() => onOpenChange?.(false)}
                theme="secondary"
                Icon={GearIcon}
                className="!w-11 min-w-[2.75rem] !h-11 rounded-lg"
                iconClassName="w-6 min-w-6 h-auto"
              />

              {updateAvailable ? (
                <div
                  className={classNames(
                    "w-2 h-2",
                    "bg-activity rounded-full",
                    "absolute top-1 right-1",
                  )}
                />
              ) : null}
            </div>

            <IconedButton
              aria-label="Open full screen"
              onClick={() => {
                openInTab(undefined, ["token"]);
                onOpenChange?.(false);
              }}
              theme="secondary"
              Icon={ExpandIcon}
              className="!w-11 min-w-[2.75rem] !h-11 rounded-lg"
              iconClassName="w-5 min-w-5 h-auto"
            />
          </>
        ) : (
          <Button
            to={{ page: Page.Settings }}
            theme="secondary"
            onClick={() => onOpenChange?.(false)}
            className="!max-h-11 w-full"
          >
            <GearIcon className={classNames("h-6 w-auto mr-2")} />
            Settings
          </Button>
        )}
      </div>
    </SecondaryModal>
  );
};

type ProfileItemProps = {
  account: Account;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
};

const ProfileItem: FC<ProfileItemProps & { size?: Size }> = ({
  account,
  onClick,
  isActive = false,
  size = "large",
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      "w-full",
      "flex items-center",
      "min-w-0 px-3 py-2",
      size === "large" ? "min-h-[3.75rem]" : "min-h-[3.25rem]",
      "border",
      "rounded-lg",
      isActive
        ? "border-brand-redone bg-brand-main/10"
        : "border-transparent hover:bg-brand-main/5 focus-visible:bg-brand-main/5",
      className,
    )}
  >
    <WalletAvatar
      seed={account.address}
      className={classNames(
        "h-8 w-8 min-w-[2rem]",
        "mr-3",
        "bg-black/20",
        "rounded-[.625rem]",
      )}
    />

    <span className="flex flex-col text-left min-w-0 max-w-[40%] mr-auto">
      <WalletName
        wallet={account}
        theme="small"
        className={classNames(size === "large" ? "text-base" : "text-sm")}
      />
      <HashPreview
        hash={account.address}
        className={classNames(
          "font-normal",
          isActive ? "text-brand-light" : "text-brand-inactivedark",
          size === "large" ? "text-sm" : "text-xs",
        )}
        withTooltip={false}
      />
    </span>

    <TotalWalletBalance
      address={account.address}
      className="text-base font-bold text-brand-light ml-auto"
    />
  </button>
);

const LockButton: FC = () => {
  const approvals = useLazyAtomValue(approvalsAtom);
  const { confirm } = useDialog();

  const isPopup = isPopupPrimitive();

  const handleLock = useCallback(async () => {
    try {
      const approvalsAmount = approvals?.length ?? 0;
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
  }, [approvals?.length, confirm, isPopup]);

  return (
    <Button
      onClick={handleLock}
      theme="secondary"
      className="w-full grow-1 !max-h-11"
    >
      <div className="flex -mt-[0.1rem]">
        <LockIcon className="h-6 w-auto mr-2" />
        Lock
      </div>
    </Button>
  );
};
