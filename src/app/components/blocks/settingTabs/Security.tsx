import { FC, memo, useRef, useState } from "react";
import classNames from "clsx";

import { getSeedPhrase } from "core/client";
import Switcher from "app/components/elements/Switcher";
import SecondaryModal from "app/components/elements/SecondaryModal";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";
import Input from "app/components/elements/Input";
import IconedButton from "app/components/elements/IconedButton";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";

const Security: FC = () => {
  const [passwordConfirm, setPasswordConfirm] = useState(false);
  const [syncData, setSyncData] = useState(false);
  const [phishing, setPhishing] = useState(false);
  const [showPhrase, setShowPhrase] = useState("");

  const onRevealClickHandler = () => {
    setPasswordConfirm(true);
  };
  const onPwdConfirm = async (password: string) => {
    try {
      const seed = await getSeedPhrase(password);
      setShowPhrase(seed.phrase);
    } catch (err) {
      console.log(`error`, err);
    }
  };
  const onSyncToggle = () => {
    setSyncData(!syncData);
  };
  const onPhishingToggle = () => {
    setPhishing(!phishing);
  };
  return (
    <div className={classNames("flex flex-col", "px-4")}>
      <h3 className="font-bold text-lg">Reveal Seed Phrase</h3>
      <button
        className={classNames(
          "mt-3",
          "pl-3 py-[7px] w-[157px]",
          "rounded-[.375rem]",
          "inline-flex items-center",
          "transition",
          "text-brand-light text-lg font-bold",
          "bg-brand-main bg-opacity-20",
          "hover:bg-brand-darklight hover:bg-opacity-100 hover:shadow-buttonsecondary",
          "focus-visible:bg-brand-darklight focus-visible:bg-opacity-100 focus-visible:shadow-buttonsecondary",
          "active:bg-brand-main active:text-brand-light/60 active:bg-opacity-10 active:shadow-none"
        )}
        onClick={onRevealClickHandler}
      >
        <RevealIcon className="pr-3" />
        Reveal
      </button>
      <div className="mt-3">
        <label
          className={classNames(
            "ml-4 mb-2",
            "text-base font-normal",
            "text-brand-gray"
          )}
          htmlFor="Sync"
        >
          Sync data using third-party explorers
        </label>
        <Switcher
          label="Sync"
          toggle={syncData}
          setToggle={onSyncToggle}
          className={classNames("mt-3 px-3")}
        ></Switcher>
      </div>
      <div className="mt-3 ">
        <label
          className={classNames(
            "ml-4 mb-2",
            "text-base font-normal",
            "text-brand-gray"
          )}
          htmlFor="Use"
        >
          Use Phishing Detection
        </label>
        <Switcher
          label="Use"
          toggle={phishing}
          setToggle={onPhishingToggle}
          className={classNames("mt-3 px-3")}
        ></Switcher>
      </div>
      <SeedPhraseModal
        open={passwordConfirm}
        showPhrase={showPhrase}
        onPwdConfirm={onPwdConfirm}
        onOpenChange={() => {
          setShowPhrase("");
          setPasswordConfirm(false);
        }}
      />
    </div>
  );
};

interface PasswordConfirmModalProps {
  open: boolean;
  showPhrase: string;
  onPwdConfirm: (password: string) => void;
  onOpenChange: () => void;
}

const SeedPhraseModal = memo<PasswordConfirmModalProps>(
  ({ open, showPhrase, onPwdConfirm, onOpenChange }) => {
    const [inputShowState, setInputShowState] = useState(false);
    const passwordFieldRef = useRef<HTMLInputElement>(null);

    const handler = () => {
      if (passwordFieldRef.current) {
        onPwdConfirm(passwordFieldRef.current.value);
      }
    };
    const onEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.code === "Enter") {
        handler();
      }
    };

    // TODO: Show if password invalid
    return (
      <SecondaryModal
        open={open}
        onOpenChange={onOpenChange}
        className="px-[5.25rem]"
      >
        {showPhrase !== "" ? (
          <SeedPhraseField
            readOnly
            value="power of a scalable software localization platform to enter new markets"
          />
        ) : (
          <>
            <div className="w-full relative mb-3">
              <Input
                ref={passwordFieldRef}
                type={inputShowState ? "text" : "password"}
                placeholder="Type password"
                label="Confirm your password"
                onKeyPress={onEnter}
                className="w-full"
              />
              <IconedButton
                Icon={inputShowState ? EyeIcon : OpenedEyeIcon}
                theme="tertiary"
                aria-label={`${inputShowState ? "Hide" : "Show"} password`}
                onClick={() => setInputShowState(!inputShowState)}
                tabIndex={-1}
                className="absolute bottom-2.5 right-3"
              />
            </div>
            <button
              className={classNames(
                "mt-3",
                "pl-3 py-[7px] w-[157px]",
                "rounded-[.375rem]",
                "inline-flex items-center",
                "transition",
                "text-brand-light text-lg font-bold",
                "bg-brand-main bg-opacity-20",
                "hover:bg-brand-darklight hover:bg-opacity-100 hover:shadow-buttonsecondary",
                "focus-visible:bg-brand-darklight focus-visible:bg-opacity-100 focus-visible:shadow-buttonsecondary",
                "active:bg-brand-main active:text-brand-light/60 active:bg-opacity-10 active:shadow-none"
              )}
              onClick={handler}
            >
              <RevealIcon className="pr-3" />
              Reveal
            </button>
          </>
        )}
      </SecondaryModal>
    );
  }
);

export default Security;
