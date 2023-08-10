import { memo, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { Link } from "lib/navigation";
import { TReplace } from "lib/ext/i18n/react";

import { Page } from "app/nav";
import { profileStateAtom } from "app/atoms";

const ProfileNav = memo(() => {
  const { all, currentId } = useAtomValue(profileStateAtom);

  const profilesLength = all.length;
  const currentProfile = useMemo(
    () => all.find(({ id }) => id === currentId)!,
    [all, currentId],
  );

  return profilesLength > 1 ? (
    <Link
      to={{ page: Page.Profiles }}
      className={classNames("inline-flex items-center justify-center p-6")}
    >
      <span className="text-xl text-white">
        <TReplace msg={currentProfile.name} />
      </span>
    </Link>
  ) : null;
});

export default ProfileNav;
