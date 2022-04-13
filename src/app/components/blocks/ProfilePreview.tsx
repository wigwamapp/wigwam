import { memo } from "react";
import classNames from "clsx";
import { Profile } from "lib/ext/profile";
import { replaceT, TReplace } from "lib/ext/react";

import AutoIcon from "app/components/elements/AutoIcon";

type ProfilePreviewProps = {
  theme?: "large" | "small" | "extrasmall";
  profile: Profile;
};

const ProfilePreview = memo<ProfilePreviewProps>(
  ({ theme = "large", profile }) => {
    return (
      <div
        className={classNames(
          "flex flex-col items-center",
          theme === "small" && "max-w-24",
          theme === "extrasmall" && "max-w-20"
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
            theme === "extrasmall" && "w-20 h-20",
            theme === "extrasmall" ? "text-3xl" : "text-4xl",
            theme === "large" && "mb-5",
            theme === "small" && "mb-3",
            theme === "extrasmall" && "mb-2"
          )}
        />

        <h3
          className={classNames(
            "font-bold truncate",
            theme === "large" ? "text-[2rem]" : "text-lg"
          )}
        >
          <TReplace msg={profile.name} />
        </h3>
      </div>
    );
  }
);

export default ProfilePreview;
