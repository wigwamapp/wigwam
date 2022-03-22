import { FC } from "react";
import classNames from "clsx";
import UserAddIcon from "@heroicons/react/solid/UserAddIcon";
import { Link } from "lib/navigation";
import { T } from "lib/ext/react";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";

const LetsBegin: FC = () => (
  <BoardingPageLayout header={false}>
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="mb-24 text-6xl text-white text-center">
        <T i18nKey="letsBegin" />
      </h1>

      <Link
        to={{ addAccOpened: true }}
        merge
        className={classNames(
          "inline-flex items-center",
          "text-3xl",
          "text-gray-100",
          "transition ease-in-out duration-300",
          "animate-pulse hover:animate-none focus:animate-none"
        )}
      >
        <T i18nKey="addWallet" />
        <UserAddIcon className="h-8 w-auto ml-4" />
      </Link>
    </div>
  </BoardingPageLayout>
);

export default LetsBegin;
