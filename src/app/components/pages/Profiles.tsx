import { FC, memo, useCallback, useMemo, useState, useRef } from "react";
import classNames from "clsx";

import { changeProfile, addProfile } from "lib/ext/profile";
import { T, TReplace, useI18NUpdate, replaceT } from "lib/ext/i18n/react";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import DialogWrapper from "app/components/layouts/DialogWrapper";
import AutoIcon from "app/components/elements/AutoIcon";
import TextField from "app/components/elements/TextField";
import { useAtomValue } from "jotai/utils";
import { profileStateAtom } from "app/atoms";

const Profiles: FC = () => {
  const { all, currentId } = useAtomValue(profileStateAtom);

  const [adding, setAdding] = useState(false);

  const handleCancelAdding = useCallback(() => {
    setAdding(false);
  }, [setAdding]);

  const handleAdd = useCallback(async (name: string) => {
    const { id } = await addProfile(name);
    changeProfile(id);
  }, []);

  const handleSelect = useCallback((profile) => {
    changeProfile(profile.id);
  }, []);

  return (
    <BoardingPageLayout title="Profiles" profileNav={false}>
      <div className="-mx-4 flex flex-wrap items-stretch">
        {all.map((p) => {
          const active = p.id === currentId;

          return (
            <div key={p.id} className="p-4">
              <button
                className={classNames(
                  "pb-4",
                  "flex flex-col items-center",
                  "border",
                  active
                    ? "border-red-500"
                    : "border-white hover:bg-white hover:bg-opacity-5"
                )}
                onClick={active ? undefined : () => handleSelect(p)}
              >
                <AutoIcon
                  seed={p.avatarSeed}
                  className="w-36 h-36 mb-4"
                  source="boring"
                  variant="pixel"
                  square
                />

                <span className="text-xl">
                  <TReplace msg={p.name} />
                </span>
              </button>
            </div>
          );
        })}

        <div className="p-4">
          <button
            className={classNames(
              "h-full w-36 pb-4",
              "flex flex-col items-center justify-center",
              "border border-white",
              "hover:bg-white hover:bg-opacity-5",
              "text-xl"
            )}
            onClick={() => setAdding(true)}
          >
            + Add new
          </button>
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
