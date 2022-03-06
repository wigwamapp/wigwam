import { FC } from "react";
import classNames from "clsx";

const About: FC = () => {
  return (
    <div className={classNames("flex flex-col", "py-3 px-4 mb-2")}>
      <h3>About</h3>
    </div>
  );
};

export default About;
