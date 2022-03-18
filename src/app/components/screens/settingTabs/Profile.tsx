import { FC } from "react";
import classNames from "clsx";

const Profile: FC = () => {
  return (
    <div className={classNames("flex flex-col", "py-3 px-4 mb-2")}>
      <h3>Profile</h3>
    </div>
  );
};

export default Profile;
