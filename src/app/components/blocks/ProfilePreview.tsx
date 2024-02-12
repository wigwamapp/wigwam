import { memo } from "react";
import classNames from "clsx";
import { Profile } from "lib/ext/profile";
import { replaceT, TReplace } from "lib/ext/react";

import AutoIcon from "app/components/elements/AutoIcon";

type ProfilePreviewProps = {
  theme?: "large" | "small" | "extrasmall";
  profile: Profile;
  className?: string;
};

const ProfilePreview = memo<ProfilePreviewProps>(
  ({ theme = "large", profile, className }) => {
    return (
      <div
        className={classNames(
          "flex flex-col justify-center items-center",
          "w-full",
          theme === "extrasmall" && "max-w-20",
          className,
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
            theme === "extrasmall" && "mb-2",
          )}
        />

        <h3
          className={classNames(
            "w-full",
            "font-bold text-center truncate",
            theme === "large" ? "text-3xl" : "text-lg",
          )}
        >
          <TReplace msg={profile.name} />
        </h3>
      </div>
    );
  },
);

export default ProfilePreview;
