import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import classNames from "clsx";

import AutoIcon from "app/components/elements/AutoIcon";
import { ReactComponent as RegenerateIcon } from "app/icons/refresh.svg";
import { ReactComponent as PlusIcon } from "app/icons/bold-plus.svg";
import Input from "app/components/elements/Input";
import NewButton from "../elements/NewButton";
import { Field, Form } from "react-final-form";
import { required } from "core/client";

type ProfileGenProps = {
  profilesLength: number;
  label: string;
  editMode?: boolean;
  seed?: string;
  profileName?: string;
  onAdd: (value: string, profileSeed: string) => void;
  className?: string;
};

const ProfileGen: FC<ProfileGenProps> = ({
  profilesLength,
  label,
  profileName,
  editMode,
  seed,
  onAdd,
  className,
}) => {
  const [profileSeed, setProfileSeed] = useState(nanoid);

  const defaultNameValue = useMemo(
    () => `Profile ${profilesLength + 1}`,
    [profilesLength]
  );

  const [nameValue, setNameValue] = useState(defaultNameValue);

  useEffect(() => {
    if (profileName && nameValue === defaultNameValue && seed) {
      setNameValue(profileName);
      setProfileSeed(seed);
    }
  }, [profileName, nameValue, defaultNameValue, seed]);

  const regenerateProfileSeed = useCallback(() => {
    setProfileSeed(nanoid());
  }, []);

  const handleAdd = useCallback(
    ({ profileName }) => {
      const value = profileName;
      if (value) {
        onAdd(value, profileSeed);
      }
    },
    [onAdd, profileSeed]
  );

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
      <Form
        onSubmit={handleAdd}
        render={({
          handleSubmit,
          submitting,
          valid,
          pristine,
          modifiedSinceLastSubmit,
        }: any) => (
          <form className="w-full max-w-[18rem]" onSubmit={handleSubmit}>
            <Field name="profileName" validate={required}>
              {({ input, meta }: any) => {
                const props = {
                  ...input,
                  onChange: (e: React.FormEvent<HTMLInputElement>) => {
                    setNameValue(e.currentTarget.value);
                    input.onChange(e);
                  },
                };
                return (
                  <Input
                    label={label}
                    className="min-h-[7rem]"
                    inputClassName={editMode ? "max-h-11" : ""}
                    placeholder="Enter your name"
                    error={meta.error && meta.touched}
                    errorMessage={meta.error}
                    {...props}
                  />
                );
              }}
            </Field>

            <NewButton
              type="submit"
              className={editMode ? "!py-2" : "w-full flex items-center"}
              disabled={
                submitting || pristine || (!valid && !modifiedSinceLastSubmit)
              }
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
        )}
      />
    </div>
  );
};

export default ProfileGen;
