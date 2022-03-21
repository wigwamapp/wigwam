import { FC, useCallback, useMemo, useState } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Form, Field } from "react-final-form";

import { updateProfile } from "lib/ext/profile";
import { changePassword } from "core/client";
import { profileStateAtom } from "app/atoms";

import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import SettingsHeader from "app/components/elements/SettingsHeader";
import ProfileGen from "app/components/blocks/ProfileGen";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import IconedButton from "app/components/elements/IconedButton";

const Profile: FC = () => {
  const { all, currentId } = useAtomValue(profileStateAtom);

  const currentProfile = useMemo(
    () => all.find((profile) => profile.id === currentId)!,
    [all, currentId]
  );
  const currentName = currentProfile.name;
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
  interface Values {
    oldPwd: string;
    newPwd: string;
    confirmNewPwd: string;
  }
  const onSubmit = async (values: Values, form: any) => {
    try {
      await changePassword(values.oldPwd, values.newPwd);
      setInvalidPwd("");
      form.restart();
    } catch (error: any) {
      setInvalidPwd(error.message);
    }
  };

  const validate = (values: Values) => {
    const errors: Partial<Values> = {};
    if (!values.oldPwd) {
      errors.oldPwd = "Required";
    }
    if (!values.newPwd) {
      errors.newPwd = "Required";
    }
    if (!values.confirmNewPwd) {
      errors.confirmNewPwd = "Required";
    }
    if (values.confirmNewPwd !== values.newPwd) {
      errors.confirmNewPwd = "Passwords doesn't match";
    }

    return errors;
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
        validate={validate}
        render={({ handleSubmit, submitting }) => (
          <form className="mt-6 max-w-[18rem]" onSubmit={handleSubmit}>
            <SettingsHeader>Change password</SettingsHeader>
            <PasswordField name="oldPwd"></PasswordField>
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
            <PasswordField name="newPwd"></PasswordField>
            <PasswordField name="confirmNewPwd"></PasswordField>
            <NewButton
              type="submit"
              className="!py-2 ml-4 mt-8"
              disabled={submitting}
            >
              Save
            </NewButton>
          </form>
        )}
      />
    </div>
  );
};

type PasswordFieldProps = {
  name: string;
};

const PasswordField: React.FC<PasswordFieldProps> = ({ name }) => {
  const [show, setShow] = useState(false);

  return (
    <Field name={name}>
      {({ input, meta }) => (
        <div className="max-w-[19rem] w-full relative">
          <Input
            className="mt-4"
            type={show ? "text" : "password"}
            error={meta.error && meta.touched}
            errorMessage={meta.error}
            inputClassName="max-h-11"
            {...input}
            label="Confirm new password"
          />
          <IconedButton
            Icon={show ? EyeIcon : OpenedEyeIcon}
            aria-label={`${show ? "Hide" : "Show"} password`}
            theme="tertiary"
            onClick={() => setShow(!show)}
            tabIndex={-1}
            className="absolute top-11 right-3"
          />
        </div>
      )}
    </Field>
  );
};

export default Profile;
