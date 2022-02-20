import { FC, memo, useCallback, useMemo, useState, useRef } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { changeProfile, addProfile } from "lib/ext/profile";
import { nanoid } from "nanoid";

import { profileStateAtom } from "app/atoms";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import SecondaryModal, {
  SecondaryModalProps,
} from "app/components/elements/SecondaryModal";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import AutoIcon from "app/components/elements/AutoIcon";
import ProfilePreview from "app/components/blocks/ProfilePreview";
import { ReactComponent as AddNewIcon } from "app/icons/add-new.svg";
import { ReactComponent as RegenerateIcon } from "app/icons/refresh.svg";
import { ReactComponent as PlusIcon } from "app/icons/bold-plus.svg";

const Profiles: FC = () => {
  const { all, currentId } = useAtomValue(profileStateAtom);

  const [adding, setAdding] = useState(false);

  const handleCancelAdding = useCallback(() => {
    setAdding(false);
  }, [setAdding]);

  const handleAdd = useCallback(async (name: string, profileSeed: string) => {
    try {
      await addProfile(name, profileSeed);

      setAdding(false);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleSelect = useCallback((profile) => {
    changeProfile(profile.id);
  }, []);

  return (
    <BoardingPageLayout profileNav={false}>
      <div className="max-w-[40rem] mx-auto">
        <div className="flex flex-wrap items-stretch -mb-2">
          {all.map((p, index) => {
            const active = p.id === currentId;
            const isLastInRow = (index + 1) % 4 === 0;

            return (
              <button
                key={p.id}
                className={classNames(
                  "py-6 px-7 max-h-[11.75rem] w-[9.625rem] mb-2",
                  "rounded-[.625rem]",
                  "flex items-center justify-center",
                  "transition-colors",
                  active ? "bg-brand-main/20" : "hover:bg-brand-main/10",
                  !isLastInRow && "mr-2"
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
              "hover:bg-brand-main/10 focus:bg-brand-main/10",
              "active:bg-brand-main/[.05]"
            )}
          >
            <span className="rounded-full flex items-center justify-center bg-brand-main/10 w-24 h-24 mb-4">
              <AddNewIcon className="w-10 h-10" />
            </span>
            <span className="text-lg font-bold">Add new</span>
          </button>
        </div>
        <div className="mt-[7.5rem]">
          <h2 className="text-2xl font-bold mb-4">FAQ</h2>
          <p className="text-base	text-brand-inactivelight">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus dolor purus non enim praesent elementum facilisis
            leo, vel fringilla est ullamcorper eget nulla facilisi etiam
            dignissim diam quis enim lobortis scelerisque fermentum dui faucibus
            in ornare quam viverra orci sagittis eu volutpat odio.
          </p>
        </div>
      </div>

      <AddProfileDialog
        key={String(adding)}
        open={adding}
        profilesLength={all.length}
        onOpenChange={handleCancelAdding}
        onAdd={handleAdd}
      />
    </BoardingPageLayout>
  );
};

export default Profiles;

type AddProfileDialogProps = SecondaryModalProps & {
  profilesLength: number;
  onAdd: (name: string, profileSeed: string) => void;
};

const AddProfileDialog = memo<AddProfileDialogProps>(
  ({ open, onOpenChange, profilesLength, onAdd }) => {
    const [profileSeed, setProfileSeed] = useState(nanoid);

    const nameFieldRef = useRef<HTMLInputElement>(null);

    const defaultNameValue = useMemo(
      () => `Profile ${profilesLength + 1}`,
      [profilesLength]
    );

    const [nameValue, setNameValue] = useState(defaultNameValue);

    const handleNameFieldChange = useCallback(
      (evt) => {
        setNameValue(evt.target.value);
      },
      [setNameValue]
    );

    const regenerateProfileSeed = useCallback(() => {
      setProfileSeed(nanoid());
    }, []);

    const handleAdd = useCallback(() => {
      const value = nameFieldRef.current?.value;
      if (value) {
        onAdd(value, profileSeed);
      }
    }, [onAdd, profileSeed]);

    return (
      <SecondaryModal open={open} onOpenChange={onOpenChange}>
        <h2 className="mb-[3.25rem] text-[2rem] font-bold">
          Add a New Profile
        </h2>
        <div className="flex justify-center items-center w-full">
          <div className="mr-16 flex flex-col items-center">
            <AutoIcon
              seed={profileSeed}
              source="boring"
              variant="marble"
              autoColors
              initialsSource={nameValue}
              className={"w-[7.75rem] h-[7.75rem] text-5xl"}
            />
            <NewButton
              theme="tertiary"
              className="flex items-center !text-sm !font-normal !min-w-0 !px-3 !py-2 mt-3"
              onClick={regenerateProfileSeed}
            >
              <RegenerateIcon className="mr-2" />
              Regenerate
            </NewButton>
          </div>
          <form className="w-full max-w-[18rem]">
            <Input
              ref={nameFieldRef}
              label="Name"
              placeholder="Enter your name"
              value={nameValue}
              onChange={handleNameFieldChange}
              required
            />

            <NewButton
              type="submit"
              className="mt-6 w-full flex items-center"
              onClick={handleAdd}
            >
              Add
              <PlusIcon className="ml-1" />
            </NewButton>
          </form>
        </div>
      </SecondaryModal>
    );
  }
);
