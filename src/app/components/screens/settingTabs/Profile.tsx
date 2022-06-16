import { FC, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import { Form, Field } from "react-final-form";
import type { FormApi } from "final-form";
import { updateProfile } from "lib/ext/profile";
import { replaceT, useI18NUpdate } from "lib/ext/react";

import { changePassword } from "core/client";

import {
  composeValidators,
  differentPasswords,
  required,
  withHumanDelay,
  focusOnErrors,
} from "app/utils";
import { profileStateAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
import { useToast } from "app/hooks/toast";
import Button from "app/components/elements/Button";
import SettingsHeader from "app/components/elements/SettingsHeader";
import ProfileGen from "app/components/blocks/ProfileGen";
import Separator from "app/components/elements/Seperator";
import PasswordField from "app/components/elements/PasswordField";

type FormValues = {
  oldPwd: string;
  newPwd: string;
  confirmNewPwd: string;
};

const Profile: FC = () => {
  const { all, currentId } = useAtomValue(profileStateAtom);
  const { updateToast } = useToast();
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
        updateToast("Profile name successfully updated!");
      } catch (err) {
        console.error(err);
      }
    },
    [currentId, updateToast]
  );

  const handlePasswordChange = useCallback(
    async (values: FormValues, form: FormApi<FormValues>) =>
      withHumanDelay(async () => {
        try {
          await changePassword(values.oldPwd, values.newPwd);
          updateToast("Profile password successfully updated!");
          form.restart();
          return;
        } catch (error: any) {
          return { oldPwd: error.message };
        }
      }),
    [updateToast]
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
      <Form<FormValues>
        onSubmit={handlePasswordChange}
        decorators={[focusOnErrors]}
        render={({
          handleSubmit,
          submitting,
          modifiedSinceLastSubmit,
          values,
        }) => (
          <form className="max-w-[18rem]" onSubmit={handleSubmit}>
            <TippySingletonProvider>
              <Field name="oldPwd" validate={required}>
                {({ input, meta }) => (
                  <PasswordField
                    error={
                      (!modifiedSinceLastSubmit && meta.submitError) ||
                      (meta.error && meta.touched)
                    }
                    errorMessage={
                      meta.error ||
                      (!modifiedSinceLastSubmit && meta.submitError)
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
            <Button type="submit" className="!py-2 mt-8" loading={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </form>
        )}
      />
    </>
  );
};

export default Profile;
