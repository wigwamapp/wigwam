import { memo } from "react";
import classNames from "clsx";
import { Profile } from "lib/ext/profile";
import { replaceT, TReplace } from "lib/ext/react";

import AutoIcon from "app/components/elements/AutoIcon";

type ProfilePreviewProps = {
  theme?: "large" | "small";
  profile: Profile;
};

const ProfilePreview = memo<ProfilePreviewProps>(
  ({ theme = "large", profile }) => {
    return (
      <div
        className={classNames(
          "flex flex-col items-center",
          theme === "small" && "max-w-24"
        )}
      >
        <AutoIcon
          seed={profile.avatarSeed}
          source="boring"
          variant="marble"
          autoColors
          initialsSource={replaceT(profile.name)}
          className={classNames(
            "w-24 h-24",
            theme === "large" && "mb-5",
            theme === "small" && "mb-4"
          )}
        />

        <h3
          className={classNames(
            "font-bold",
            theme === "large" && "text-[2rem]",
            theme === "small" && "text-lg"
          )}
        >
          <TReplace msg={profile.name} />
        </h3>
      </div>
    );
  }
);

export default ProfilePreview;
