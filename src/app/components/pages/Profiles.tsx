import { FC, memo, useCallback, useMemo, useState, useRef } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { changeProfile, addProfile } from "lib/ext/profile";
import { T, useI18NUpdate, replaceT } from "lib/ext/i18n/react";

import { profileStateAtom } from "app/atoms";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import DialogWrapper from "app/components/layouts/DialogWrapper";
import TextField from "app/components/elements/TextField";
import ProfilePreview from "app/components/blocks/ProfilePreview";
import { ReactComponent as AddNewIcon } from "app/icons/add-new.svg";

const Profiles: FC = () => {
  const { all, currentId } = useAtomValue(profileStateAtom);

  const [adding, setAdding] = useState(false);

  const handleCancelAdding = useCallback(() => {
    setAdding(false);
  }, [setAdding]);

  const handleAdd = useCallback(async (name: string) => {
    try {
      await addProfile(name);

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
        adding={adding}
        profilesLength={all.length}
        onClose={handleCancelAdding}
        onAdd={handleAdd}
      />
    </BoardingPageLayout>
  );
};

export default Profiles;

type AddProfileDialogProps = {
  adding: boolean;
  profilesLength: number;
  onClose: () => void;
  onAdd: (name: string) => void;
};

const AddProfileDialog = memo<AddProfileDialogProps>(
  ({ adding, profilesLength, onClose, onAdd }) => {
    useI18NUpdate();

    const nameFieldRef = useRef<HTMLInputElement>(null);
    const defaultNameSource = useMemo(
      () => `{{profile}} ${profilesLength + 1}`,
      [profilesLength]
    );
    const defaultNameValue = replaceT(defaultNameSource);

    const handleAdd = useCallback(() => {
      const value = nameFieldRef.current?.value;
      if (value) {
        onAdd(value === defaultNameValue ? defaultNameSource : value);
      }
    }, [onAdd, defaultNameValue, defaultNameSource]);

    return (
      <DialogWrapper
        displayed={adding}
        title={<T i18nKey="profiles" />}
        description="Lorem ipsum dolor sit amet..."
        onClose={onClose}
      >
        <form className="mt-4">
          <TextField ref={nameFieldRef} defaultValue={defaultNameValue} />

          <div className="mt-8 w-full flex items-stretch">
            <button
              type="button"
              className={classNames(
                "inline-flex p-4 text-gray-300 hover:text-gray-100 text-xl",
                "transition ease-in-out duration-200"
              )}
              onClick={onClose}
            >
              <T i18nKey="cancel" />
            </button>

            <div className="flex-1" />

            <button
              type="button"
              className={classNames(
                "inline-flex p-4 text-gray-300 hover:text-gray-100 text-xl",
                "transition ease-in-out duration-200"
              )}
              onClick={handleAdd}
            >
              <T i18nKey="add" />
            </button>
          </div>
        </form>
      </DialogWrapper>
    );
  }
);
