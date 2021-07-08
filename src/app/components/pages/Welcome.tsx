import { FC } from "react";
import { Link } from "woozie";
import ArrowNarrowRightIcon from "@heroicons/react/solid/ArrowNarrowRightIcon";

import { T } from "lib/ext/react";
import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import ProfileNav from "app/components/blocks/ProfileNav";

const Welcome: FC = () => (
  <>
    <div className="flex items-center my-8">
      <div className="flex-1" />
      <ProfileNav />
    </div>

    <BoardingPageLayout title={<T i18nKey="welcomeTo" values={"Vigvam"} />}>
      <Link to="/add-account" className="inline-flex items-center">
        Continue
        <ArrowNarrowRightIcon className="h-4 w-auto ml-2" />
      </Link>
    </BoardingPageLayout>
  </>
);

export default Welcome;
