import { FC } from "react";
import classNames from "clsx";
import { Link } from "woozie";
import ArrowNarrowRightIcon from "@heroicons/react/solid/ArrowNarrowRightIcon";

import { T } from "lib/ext/react";

const Welcome: FC = () => (
  <div
    className={classNames("min-h-screen", "flex items-center justify-center")}
  >
    <article className="prose-xl dark:prose-dark text-center">
      <h1>
        <T id="welcomeTo" subs={"Vigvam"} />
      </h1>

      <p>Bla bla bla</p>

      <Link to="/add-account" className="inline-flex items-center">
        Continue
        <ArrowNarrowRightIcon className="h-4 w-auto ml-2" />
      </Link>
    </article>
  </div>
);

export default Welcome;
