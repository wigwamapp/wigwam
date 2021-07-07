import { FC, Suspense, useState } from "react";
import classNames from "clsx";
import { Link } from "woozie";
import { useQuery } from "react-query";
import ArrowNarrowRightIcon from "@heroicons/react/solid/ArrowNarrowRightIcon";

import { T } from "lib/ext/react";
import { useStorageQuery } from "app/queries";
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
        <div className="flex items-center justify-center mb-8">
          <AutoIcon
            seed="ASD"
            className="w-24 h-24 mr-8"
            source="boring"
            variant="bauhaus"
            square
          />

          <AutoIcon seed="ASD" className="w-24 h-24 mr-8" type="avataaars" />
        </div>

        <Keks />

        <Link to="/profiles" className="inline-flex items-center">
          Continue
          <ArrowNarrowRightIcon className="h-4 w-auto ml-2" />
        </Link>
      </article>
    </div>
  </PageLayout>
);

export default Welcome;

const Keks: FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col">
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Add
      </button>
      <button
        type="button"
        onClick={() => setCount((c) => (c > 0 ? c - 1 : 0))}
      >
        Remove
      </button>

      <Suspense fallback={null}>
        {Array.from({ length: count }).map((_, i) => (
          <Kek key={i} />
        ))}
      </Suspense>
    </div>
  );
};

const Kek: FC = () => {
  const kekQuery = useStorageQuery("kek");
  const value = useQuery(kekQuery).data!;

  console.info(value);

  return null;
};
