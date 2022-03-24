import { FC, useCallback, useState } from "react";
import { nanoid } from "nanoid";
import classNames from "clsx";
import { Field, Form } from "react-final-form";

import { required } from "app/utils";
import AutoIcon from "app/components/elements/AutoIcon";
import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import { ReactComponent as RegenerateIcon } from "app/icons/refresh.svg";
import { ReactComponent as PlusIcon } from "app/icons/bold-plus.svg";

type ProfileGenProps = {
  label: string;
  defaultProfileName: string;
  defaultSeed?: string;
  onSubmit: (value: string, profileSeed: string) => void;
  editMode?: boolean;
  className?: string;
};

const ProfileGen: FC<ProfileGenProps> = ({
  label,
  defaultProfileName,
  defaultSeed,
  onSubmit,
  editMode,
  className,
}) => {
  const [profileSeed, setProfileSeed] = useState(defaultSeed ?? nanoid);

  const regenerateProfileSeed = useCallback(() => {
    setProfileSeed(nanoid());
  }, []);

  const handleAdd = useCallback(
    ({ profileName }) => {
      onSubmit(profileName, profileSeed);
    },
    [onSubmit, profileSeed]
  );

  return (
    <div className={classNames("flex w-full", className)}>
      <Form
        onSubmit={handleAdd}
        initialValues={{ profileName: defaultProfileName }}
        render={({ handleSubmit, submitting, values }) => (
          <>
            <div className="mr-16 flex flex-col items-center">
              <AutoIcon
                seed={profileSeed}
                source="boring"
                variant="marble"
                autoColors
                initialsSource={values.profileName}
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

            <form
              className="w-full max-w-[18rem] flex flex-col items-start pt-1"
              onSubmit={handleSubmit}
            >
              <Field name="profileName" validate={required}>
                {({ input, meta }) => (
                  <Input
                    label={label}
                    placeholder="Enter profile name"
                    error={meta.error && meta.touched}
                    errorMessage={meta.error}
                    className="w-full"
                    {...input}
                  />
                )}
              </Field>

              <NewButton
                type="submit"
                className={classNames(
                  "mt-5",
                  editMode ? "!py-2" : "w-full flex items-center"
                )}
                disabled={submitting}
              >
                {submitting ? (
                  editMode ? (
                    "Updating..."
                  ) : (
                    "Adding..."
                  )
                ) : editMode ? (
                  "Save"
                ) : (
                  <>
                    Add
                    <PlusIcon className="ml-1" />
                  </>
                )}
              </NewButton>
            </form>
          </>
        )}
      />
    </div>
  );
};

export default ProfileGen;
