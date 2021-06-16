import { FC } from "react";
import classNames from "clsx";
import { Link } from "woozie";
import ArrowNarrowRightIcon from "@heroicons/react/solid/ArrowNarrowRightIcon";

import { T } from "lib/ext/react";
import PageLayout from "app/components/layouts/PageLayout";
import AutoIcon from "app/components/atoms/AutoIcon";

const Welcome: FC = () => (
  <PageLayout>
    <div
      className={classNames("min-h-screen", "flex items-center justify-center")}
    >
      <article className="prose-xl dark:prose-dark text-center">
        <h1>
          <T i18nKey="welcomeTo" values={"Vigvam"} />
        </h1>

        <p>Bla bla bla</p>
        <AutoIcon type="avataaars" seed="ASD" className="w-24 h-24 mb-8" />
        <br />

        <Link to="/add-account" className="inline-flex items-center">
          Continue
          <ArrowNarrowRightIcon className="h-4 w-auto ml-2" />
        </Link>
      </article>
    </div>
  </PageLayout>
);

export default Welcome;
