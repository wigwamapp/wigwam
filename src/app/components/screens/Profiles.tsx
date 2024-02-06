import { FC, memo, useCallback, useState, useRef, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { changeProfile, addProfile, Profile } from "lib/ext/profile";
import { replaceT } from "lib/ext/i18n";

import { TEvent, trackEvent } from "core/client";

import { profileStateAtom } from "app/atoms";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import ProfileGen from "app/components/blocks/ProfileGen";
import ProfilePreview from "app/components/blocks/ProfilePreview";
import { ReactComponent as AddNewIcon } from "app/icons/add-new.svg";

const Profiles: FC = () => {
  const { all, currentId } = useAtomValue(profileStateAtom);

  const [adding, setAdding] = useState(false);

  const handleCancelAdding = useCallback(() => {
    setAdding(false);
  }, [setAdding]);

  const processingRef = useRef(false);

  const handleAdd = useCallback(async (name: string, profileSeed: string) => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      await addProfile(name, profileSeed);

      trackEvent(TEvent.ProfileCreation);

      setAdding(false);
    } catch (err) {
      console.error(err);
    }

    processingRef.current = false;
  }, []);

  const handleSelect = useCallback((profile: Profile) => {
    changeProfile(profile.id);
  }, []);

  return (
    <BoardingPageLayout>
      <div className="max-w-[40rem] mx-auto">
        <div className="flex flex-wrap items-stretch -mb-2">
          {all.map((p, index) => {
            const active = p.id === currentId;
            const isLastInRow = (index + 1) % 4 === 0;

            return (
              <button
                key={p.id}
                type="button"
                className={classNames(
                  "py-6 px-1.5 max-h-[11.75rem] w-[9.625rem] mb-2",
                  "rounded-[.625rem]",
                  "flex items-center justify-center",
                  "transition-colors",
                  active ? "bg-brand-main/20" : "hover:bg-brand-main/10",
                  !isLastInRow && "mr-2",
                )}
                onClick={active ? undefined : () => handleSelect(p)}
              >
                <ProfilePreview theme="small" profile={p} />
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setAdding(true)}
            className={classNames(
              "flex flex-col items-center",
              "w-[9.625rem] py-6 px-7 max-h-[11.75rem] mb-2",
              "rounded-[.625rem]",
              "transition-colors",
              "hover:bg-brand-main/10 focus-visible:bg-brand-main/10",
              "active:bg-brand-main/[.05]",
            )}
          >
            <span className="rounded-full flex items-center justify-center bg-brand-main/10 w-24 h-24 mb-4">
              <AddNewIcon className="w-10 h-10" />
            </span>
            <span className="text-lg font-bold">Add new</span>
          </button>
        </div>
        <div className="mt-[7.5rem] px-6 prose prose-invert">
          <h2>FAQ</h2>

          <ul>
            <li>
              <strong>Profiles</strong> enables multiple separate sessions for
              varied needs like work and personal, boosting organization and
              privacy.
            </li>

            {/* <li>
              You will always see your <strong>profile avatar</strong>, on all
              Wigwam pages. <strong>It is unique!</strong> This feature allows
              you to <strong>determine</strong> whether the Wigwam you are
              seeing is <strong>real</strong> or fake.
            </li> */}

            <li>
              Each profile can have <strong>only one Secret Phrase</strong>.
            </li>
          </ul>
        </div>
      </div>

      <AddProfileDialog
        key={String(adding)}
        open={adding}
        profilesLength={all.length}
        onOpenChange={handleCancelAdding}
        handleAddProfile={handleAdd}
      />
    </BoardingPageLayout>
  );
};

export default Profiles;

type AddProfileDialogProps = SecondaryModalProps & {
  profilesLength: number;
  handleAddProfile: (name: string, profileSeed: string) => Promise<void>;
};

const AddProfileDialog = memo<AddProfileDialogProps>(
  ({ open, onOpenChange, profilesLength, handleAddProfile }) => {
    const defaultNameValue = useMemo(
      () => `{{profile}} ${profilesLength + 1}`,
      [profilesLength],
    );

    return (
      <SecondaryModal
        header="Add a new profile"
        open={open}
        onOpenChange={onOpenChange}
        headerClassName="!mb-[3.25rem] !text-[2rem]"
      >
        <ProfileGen
          className="justify-center"
          defaultProfileName={replaceT(defaultNameValue)}
          onSubmit={handleAddProfile}
          label="Name"
        />
      </SecondaryModal>
    );
  },
);
