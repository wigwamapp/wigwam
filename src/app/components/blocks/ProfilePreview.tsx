import { memo, useCallback } from "react";
import classNames from "clsx";
import { Profile } from "lib/ext/profile";
import { TReplace } from "lib/ext/react";

import AutoIcon from "app/components/elements/AutoIcon";
import { openInTab } from "app/helpers";
import { Page } from "app/defaults";

type ProfilePreviewProps = {
  profile: Profile;
};

const ProfilePreview = memo<ProfilePreviewProps>(({ profile }) => {
  const handleClick = useCallback(() => {
    openInTab({ page: Page.Profiles });
  }, []);

  return (
    <div className="w-full flex justify-center">
      <button
        className={classNames("flex flex-col items-center", "p-4")}
        onClick={handleClick}
      >
        <AutoIcon
          seed={profile.avatarSeed}
          className="w-24 h-24 mb-4"
          source="boring"
          variant="pixel"
        />

        <h3 className="text-lg font-medium">
          <TReplace msg={profile.name} />
        </h3>
      </button>
    </div>
  );
});

export default ProfilePreview;
