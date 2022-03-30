import {
  FC,
  FormEventHandler,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import classNames from "clsx";
import { useWindowFocus } from "lib/react-hooks/useWindowFocus";

import { getSeedPhrase } from "core/client";

import Switcher from "app/components/elements/Switcher";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import SeedPhraseField from "app/components/blocks/SeedPhraseField";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import IconedButton from "app/components/elements/IconedButton";
import SettingsHeader from "app/components/elements/SettingsHeader";
import Separator from "app/components/elements/Seperator";
import { ReactComponent as RevealIcon } from "app/icons/reveal.svg";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";

const Security: FC = () => {
  const [revealModalOpened, setRevealModalOpened] = useState(false);
  const [syncData, setSyncData] = useState(false);
  const [phishing, setPhishing] = useState(false);

  return (
    <div className="flex flex-col items-start">
      <SettingsHeader>Reveal Seed Phrase</SettingsHeader>
      <NewButton
        theme="secondary"
        className={classNames(
          "flex !justify-start items-center",
          "text-left",
          "!px-3 !py-2 mr-auto"
        )}
        onClick={() => setRevealModalOpened(true)}
      >
        <RevealIcon className="w-[1.625rem] h-auto mr-3" />
        Reveal
      </NewButton>
      <Separator className="my-8" />
      <SettingsHeader>Security</SettingsHeader>
      <Switcher
        id="syncThirdParty"
        text={syncData ? "Syncing" : "Not syncing"}
        label="Sync data using third-party explorers"
        checked={syncData}
        onCheckedChange={setSyncData}
        className="min-w-[20rem]"
      />
      <Switcher
        id="phishingDetection"
        text={phishing ? "Enabled" : "Disabled"}
        checked={phishing}
        label="Use Phishing Detection"
        onCheckedChange={setPhishing}
        className="mt-3 min-w-[20rem]"
      />
      {revealModalOpened && (
        <SeedPhraseModal
          open={true}
          onOpenChange={() => setRevealModalOpened(false)}
        />
      )}
    </div>
  );
};

export default Security;

const SeedPhraseModal = memo<SecondaryModalProps>(({ open, onOpenChange }) => {
  const passwordFieldRef = useRef<HTMLInputElement>(null);
  const [inputShowState, setInputShowState] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const windowFocused = useWindowFocus();

  useEffect(() => {
    if (!windowFocused && seedPhrase) {
      onOpenChange?.(false);
    }
  }, [onOpenChange, seedPhrase, windowFocused]);

  const handleConfirmPassword = useCallback<FormEventHandler<HTMLFormElement>>(
    async (evt) => {
      evt.preventDefault();

      const password = passwordFieldRef.current?.value;
      if (password) {
        try {
          const seed = await getSeedPhrase(password);
          setSeedPhrase(seed.phrase);
        } catch (err: any) {
          alert(err?.message);
        }
      }
    },
    []
  );

  return (
    <SecondaryModal
      header="Reveal secret phrase"
      open={open}
      onOpenChange={onOpenChange}
      className="px-[5.25rem]"
    >
      {seedPhrase ? (
        <SeedPhraseField
          readOnly
          value="power of a scalable software localization platform to enter new markets"
        />
      ) : (
        <form
          className="flex flex-col items-center"
          onSubmit={handleConfirmPassword}
        >
          <div className="w-[20rem] relative mb-3">
            <Input
              ref={passwordFieldRef}
              type={inputShowState ? "text" : "password"}
              placeholder="Type password"
              label="Confirm your password"
              className="w-full"
            />
            <IconedButton
              Icon={inputShowState ? EyeIcon : OpenedEyeIcon}
              theme="tertiary"
              aria-label={`${inputShowState ? "Hide" : "Show"} password`}
              onClick={() => setInputShowState(!inputShowState)}
              className="absolute bottom-2.5 right-3"
            />
          </div>
          <NewButton type="submit" className="!py-2 !min-w-[14rem]">
            Reveal
          </NewButton>
        </form>
      )}
    </SecondaryModal>
  );
});
