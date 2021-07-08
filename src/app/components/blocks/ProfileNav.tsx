import { memo, useMemo } from "react";
import classNames from "clsx";
import { Link } from "woozie";

import { TReplace } from "lib/ext/i18n/react";
import { getProfileId, getAllProfiles } from "lib/ext/profile";

const ProfileNav = memo(() => {
  const currentProfileId = useMemo(() => getProfileId(), []);
  const allProfiles = useMemo(() => getAllProfiles(), []);
  const currentProfile = useMemo(
    () => allProfiles.find(({ id }) => id === currentProfileId)!,
    [allProfiles, currentProfileId]
  );
  const profilesLength = allProfiles.length;

  return profilesLength > 1 ? (
    <Link
      to="/profiles"
      className={classNames("inline-flex items-center justify-center p-6")}
    >
      <span className="text-xl text-white">
        <TReplace msg={currentProfile.name} />
      </span>
    </Link>
  ) : null;
});

export default ProfileNav;
