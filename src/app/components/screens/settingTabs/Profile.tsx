import { FC, useCallback, useMemo, useState } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Form, Field } from "react-final-form";
import type { FormApi } from "final-form";
import { updateProfile } from "lib/ext/profile";
import { replaceT, useI18NUpdate } from "lib/ext/react";

import { changePassword } from "core/client";

import { composeValidators, differentPasswords, required } from "app/utils";
import { profileStateAtom } from "app/atoms";

import Input, { InputProps } from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import IconedButton from "app/components/elements/IconedButton";
import SettingsHeader from "app/components/elements/SettingsHeader";
import ProfileGen from "app/components/blocks/ProfileGen";
import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";

interface Values {
  oldPwd: string;
  newPwd: string;
  confirmNewPwd: string;
}

const Profile: FC = () => {
  const { all, currentId } = useAtomValue(profileStateAtom);
  useI18NUpdate();

  const currentProfile = useMemo(
    () => all.find((profile) => profile.id === currentId)!,
    [all, currentId]
  );
  const currentName = replaceT(currentProfile.name);
  const currentSeed = currentProfile.avatarSeed;

  const handleAdd = useCallback(
    async (name: string, profileSeed: string) => {
      try {
        await updateProfile(currentId, { name, avatarSeed: profileSeed });
      } catch (err) {
        console.error(err);
      }
    },
    [currentId]
  );

  const [invalidPwd, setInvalidPwd] = useState("");

  const onSubmit = async (values: Values, form: FormApi<Values>) => {
    try {
      await changePassword(values.oldPwd, values.newPwd);
      setInvalidPwd("");
      form.restart();
    } catch (error: any) {
      setInvalidPwd(error.message);
    }
  };

  return (
    <div className={classNames("flex flex-col grow", "px-6")}>
      <SettingsHeader>Edit Profile</SettingsHeader>
      <ProfileGen
        className="justify-items-start border-b px-3 pb-6 border-brand-main/[.07]"
        profilesLength={all.length}
        onAdd={handleAdd}
        seed={currentSeed}
        label="Profile name"
        profileName={currentName}
        editMode
      />

      <Form
        onSubmit={onSubmit}
        render={({
          handleSubmit,
          submitting,
          valid,
          pristine,
          modifiedSinceLastSubmit,
        }) => (
          <form className="mt-6 max-w-[18rem]" onSubmit={handleSubmit}>
            <SettingsHeader>Change password</SettingsHeader>
            <PasswordField
              name="oldPwd"
              validate={composeValidators(required)}
              label="Confirm old password"
              placeholder="Type old password"
            />
            <div
              className={classNames(
                "max-h-0 overflow-hidden",
                invalidPwd && "max-h-6",
                "transition-[max-height] duration-200"
              )}
            >
              {invalidPwd && (
                <span className="text-brand-redone pt-2 pl-4 text-sm">
                  {invalidPwd}
                </span>
              )}
            </div>
            <PasswordField
              name="newPwd"
              validate={composeValidators(required)}
              label="New password"
              placeholder="Type new password"
            />
            <PasswordField
              name="confirmNewPwd"
              validate={composeValidators(
                required,
                differentPasswords("newPwd")
              )}
              label="Confirm new password"
              placeholder="Confirm new password"
            />
            <NewButton
              type="submit"
              className="!py-2 ml-4 mt-8"
              disabled={
                submitting || pristine || (!valid && !modifiedSinceLastSubmit)
              }
            >
              Save
            </NewButton>
          </form>
        )}
      />
    </div>
  );
};

export default Profile;

type PasswordFieldProps = {
  name: string;
  validate: (val: string) => string | undefined;
} & Omit<InputProps, "name" | "ref">;

const PasswordField: FC<PasswordFieldProps> = ({ name, validate, ...rest }) => {
  const [show, setShow] = useState(false);

  return (
    <Field name={name} validate={validate}>
      {({ input, meta }) => (
        <div className="max-w-[19rem] w-full relative">
          <Input
            id={name}
            type={show ? "text" : "password"}
            error={meta.error && meta.touched}
            errorMessage={meta.error}
            className="mt-4"
            inputClassName="max-h-11"
            {...rest}
            {...input}
          />
          <IconedButton
            Icon={show ? EyeIcon : OpenedEyeIcon}
            aria-label={`${show ? "Hide" : "Show"} password`}
            theme="tertiary"
            onClick={() => setShow(!show)}
            tabIndex={-1}
            className="absolute top-[2.625rem] right-3"
          />
        </div>
      )}
    </Field>
  );
};
