import { FC, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import { Form, Field } from "react-final-form";
import type { FormApi } from "final-form";
import { FORM_ERROR } from "final-form";
import { updateProfile } from "lib/ext/profile";
import { replaceT, useI18NUpdate } from "lib/ext/react";

import { changePassword } from "core/client";

import { composeValidators, differentPasswords, required } from "app/utils";
import { profileStateAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
import NewButton from "app/components/elements/NewButton";
import SettingsHeader from "app/components/elements/SettingsHeader";
import ProfileGen from "app/components/blocks/ProfileGen";
import Separator from "app/components/elements/Seperator";
import PasswordField from "app/components/elements/PasswordField";

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
    <>
      <SettingsHeader>Edit Profile</SettingsHeader>
      <ProfileGen
        label="Profile name"
        onSubmit={handleProfileNameChange}
        defaultProfileName={currentName}
        defaultSeed={currentSeed}
        editMode
        className="px-2"
      />

      <Separator className="mt-6 mb-8" />

      <SettingsHeader>Change password</SettingsHeader>
      <Form
        onSubmit={handlePasswordChange}
        render={({
          handleSubmit,
          submitting,
          modifiedSinceLastSubmit,
          submitError,
          values,
        }) => (
          <form className="max-w-[18rem]" onSubmit={handleSubmit}>
            <TippySingletonProvider>
              <Field name="oldPwd" validate={required}>
                {({ input, meta }) => (
                  <PasswordField
                    error={
                      (!modifiedSinceLastSubmit && submitError) ||
                      (meta.error && meta.touched)
                    }
                    errorMessage={
                      meta.error || (!modifiedSinceLastSubmit && submitError)
                    }
                    label="Old password"
                    placeholder={"*".repeat(8)}
                    className="mb-4"
                    {...input}
                  />
                )}
              </Field>
              <Field name="newPwd" validate={required}>
                {({ input, meta }) => (
                  <PasswordField
                    error={meta.error && meta.touched}
                    errorMessage={meta.error}
                    label="New password"
                    placeholder={"*".repeat(8)}
                    className="mb-4"
                    {...input}
                  />
                )}
              </Field>
              <Field
                name="confirmNewPwd"
                validate={composeValidators(
                  required,
                  differentPasswords(values.newPwd)
                )}
              >
                {({ input, meta }) => (
                  <PasswordField
                    error={meta.error && meta.touched}
                    errorMessage={meta.error}
                    label="Confirm new password"
                    placeholder={"*".repeat(8)}
                    {...input}
                  />
                )}
              </Field>
            </TippySingletonProvider>
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
    </>
  );
};

export default Profile;
