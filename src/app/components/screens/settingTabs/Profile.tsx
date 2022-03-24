import { FC, useCallback, useMemo, useState } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Form, Field } from "react-final-form";
import type { FormApi } from "final-form";
import { FORM_ERROR } from "final-form";
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

type FormValuesType = {
  oldPwd: string;
  newPwd: string;
  confirmNewPwd: string;
};

const Profile: FC = () => {
  const { all, currentId } = useAtomValue(profileStateAtom);
  useI18NUpdate();

  const currentProfile = useMemo(
    () => all.find((profile) => profile.id === currentId)!,
    [all, currentId]
  );
  const currentName = replaceT(currentProfile.name);
  const currentSeed = currentProfile.avatarSeed;

  const handleProfileNameChange = useCallback(
    async (name: string, profileSeed: string) => {
      try {
        await updateProfile(currentId, { name, avatarSeed: profileSeed });
      } catch (err) {
        console.error(err);
      }
    },
    [currentId]
  );

  const handlePasswordChange = useCallback(
    async (values: FormValuesType, form: FormApi<FormValuesType>) => {
      try {
        await changePassword(values.oldPwd, values.newPwd);
        form.restart();
        return;
      } catch (error: any) {
        return { [FORM_ERROR]: error.message };
      }
    },
    []
  );

  return (
    <div className={classNames("flex flex-col grow", "px-6")}>
      <SettingsHeader>Edit Profile</SettingsHeader>
      <ProfileGen
        label="Profile name"
        onSubmit={handleProfileNameChange}
        defaultProfileName={currentName}
        defaultSeed={currentSeed}
        editMode
        className="px-2"
      />

      <hr className="w-full border-brand-main/[.07] mt-6 mb-8" />

      <SettingsHeader>Change password</SettingsHeader>
      <Form
        onSubmit={handlePasswordChange}
        render={({ handleSubmit, submitting, submitError, values }) => (
          <form className="max-w-[18rem]" onSubmit={handleSubmit}>
            <PasswordField
              name="oldPwd"
              validate={composeValidators(required)}
              errorMessage={submitError}
              label="Old password"
              placeholder="Type old password"
              className="mb-4"
            />
            <PasswordField
              name="newPwd"
              validate={composeValidators(required)}
              label="New password"
              placeholder="Type new password"
              className="mb-4"
            />
            <PasswordField
              name="confirmNewPwd"
              validate={composeValidators(
                required,
                differentPasswords(values.newPwd)
              )}
              label="Confirm new password"
              placeholder="Confirm new password"
            />
            <NewButton
              type="submit"
              className="!py-2 mt-8"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
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
  errorMessage?: string;
} & Omit<InputProps, "name" | "ref">;

const PasswordField: FC<PasswordFieldProps> = ({
  name,
  validate,
  errorMessage,
  ...rest
}) => {
  const [show, setShow] = useState(false);

  return (
    <Field name={name} validate={validate}>
      {({ input, meta }) => (
        <div className="max-w-[19rem] w-full relative">
          <Input
            id={name}
            type={show ? "text" : "password"}
            error={errorMessage || (meta.error && meta.touched)}
            errorMessage={errorMessage ?? meta.error}
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
