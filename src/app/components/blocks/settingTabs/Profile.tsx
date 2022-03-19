import { FC, useCallback, useEffect, useState } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Form, Field } from "react-final-form";

import { getProfileId, updateProfile } from "lib/ext/profile";
import { profileStateAtom } from "app/atoms";

import { ReactComponent as EyeIcon } from "app/icons/eye.svg";
import { ReactComponent as OpenedEyeIcon } from "app/icons/opened-eye.svg";
import SettingsHeader from "app/components/elements/SettingsHeader";
import ProfileGen from "../ProfileGen";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import IconedButton from "app/components/elements/IconedButton";

const Profile: FC = () => {
  const { all } = useAtomValue(profileStateAtom);
  const [id, setId] = useState("");
  const [currentName, setCurrentName] = useState("");

  useEffect(() => {
    const load = async () => {
      const id = await getProfileId();
      setId(id);
      const profileName =
        all.find((profile) => profile.id === id)?.name ?? "ZXC";
      console.log(`profileName`, profileName);
      setCurrentName(profileName);
    };
    load();
  }, [all]);

  const handleAdd = useCallback(
    async (name: string, profileSeed: string) => {
      try {
        await updateProfile(id, { name, avatarSeed: profileSeed });
      } catch (err) {
        console.error(err);
      }
    },
    [id]
  );

  const [inputShowContent, setInputShowContent] = useState(false);
  interface Values {
    oldPwd: string;
    newPwd: string;
    confirmNewPwd: string;
  }
  const onSubmit = async (values: Values) => {
    console.log(`values `, values);
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

    return errors;
  };

  return (
    <div className={classNames("flex flex-col grow", "px-6")}>
      <SettingsHeader>Edit Profile</SettingsHeader>
      <ProfileGen
        className="justify-items-start border-b px-3 pb-6 border-brand-main/[.07]"
        profilesLength={all.length}
        onAdd={handleAdd}
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
            <Field name="oldPwd">
              {({ input, meta }) => (
                <div className="max-w-[19rem] w-full relative">
                  <Input
                    className="mt-4"
                    type="password"
                    inputClassName="max-h-11"
                    {...input}
                    label="Old password"
                  />
                  {meta.error && meta.touched && <span>{meta.error}</span>}
                  <IconedButton
                    Icon={inputShowContent ? EyeIcon : OpenedEyeIcon}
                    aria-label={`${
                      inputShowContent ? "Hide" : "Show"
                    } password`}
                    theme="tertiary"
                    onClick={() => setInputShowContent(!inputShowContent)}
                    tabIndex={-1}
                    className="absolute bottom-2.5 right-3"
                  />
                </div>
              )}
            </Field>
            <Field name="newPwd">
              {({ input, meta }) => (
                <div className="max-w-[19rem] w-full relative">
                  <Input
                    className="mt-4"
                    type="password"
                    inputClassName="max-h-11"
                    {...input}
                    label="New password"
                  />
                  {meta.error && meta.touched && <span>{meta.error}</span>}
                  <IconedButton
                    Icon={inputShowContent ? EyeIcon : OpenedEyeIcon}
                    aria-label={`${
                      inputShowContent ? "Hide" : "Show"
                    } password`}
                    theme="tertiary"
                    onClick={() => setInputShowContent(!inputShowContent)}
                    tabIndex={-1}
                    className="absolute bottom-2.5 right-3"
                  />
                </div>
              )}
            </Field>
            <Field name="confirmNewPwd">
              {({ input, meta }) => (
                <div className="max-w-[19rem] w-full relative">
                  <Input
                    className="mt-4"
                    type="password"
                    inputClassName="max-h-11"
                    {...input}
                    label="Confirm new password"
                  />
                  {meta.error && meta.touched && <span>{meta.error}</span>}
                  <IconedButton
                    Icon={inputShowContent ? EyeIcon : OpenedEyeIcon}
                    aria-label={`${
                      inputShowContent ? "Hide" : "Show"
                    } password`}
                    theme="tertiary"
                    onClick={() => setInputShowContent(!inputShowContent)}
                    tabIndex={-1}
                    className="absolute bottom-2.5 right-3"
                  />
                </div>
              )}
            </Field>
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

export default Profile;
