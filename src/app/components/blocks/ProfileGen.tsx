import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import classNames from "clsx";

import AutoIcon from "app/components/elements/AutoIcon";
import { ReactComponent as RegenerateIcon } from "app/icons/refresh.svg";
import { ReactComponent as PlusIcon } from "app/icons/bold-plus.svg";
import Input from "app/components/elements/Input";
import NewButton from "../elements/NewButton";

type ProfileGenProps = {
  profilesLength: number;
  label: string;
  editMode?: boolean;
  profileName?: string;
  onAdd: (value: string, profileSeed: string) => void;
  className?: string;
};

const ProfileGen: FC<ProfileGenProps> = ({
  profilesLength,
  label,
  profileName,
  editMode,
  onAdd,
  className,
}) => {
  const [profileSeed, setProfileSeed] = useState(nanoid);

  const nameFieldRef = useRef<HTMLInputElement>(null);

  const defaultNameValue = useMemo(
    () => `Profile ${profilesLength + 1}`,
    [profilesLength]
  );

  const [nameValue, setNameValue] = useState(defaultNameValue);

  useEffect(() => {
    if (profileName && nameValue === defaultNameValue) {
      setNameValue(profileName);
    }
  }, [profileName, nameValue, defaultNameValue]);

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
    <div className={classNames("flex items-center w-full", className)}>
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
          label={label}
          inputClassName={editMode ? "max-h-11" : ""}
          placeholder="Enter your name"
          value={nameValue}
          onChange={handleNameFieldChange}
          required
        />

        <NewButton
          type="submit"
          className={editMode ? "!py-2 mt-6" : "w-full mt-6 flex items-center"}
          onClick={handleAdd}
        >
          {editMode ? (
            "Save"
          ) : (
            <>
              Add
              <PlusIcon className="ml-1" />
            </>
          )}
        </NewButton>
      </form>
    </div>
  );
};

export default ProfileGen;
