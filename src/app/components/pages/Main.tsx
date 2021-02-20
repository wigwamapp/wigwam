import React from "react";
import PageLayout from "app/components/layout/PageLayout";
import BoxIcon from "app/icons/box.svgr.svg";

const Main: React.FC = () => (
  <PageLayout>
    <div className="py-8">
      <h1 className="text-4xl font-semibold text-brand-indigo">Hello!</h1>
      <BoxIcon className="stroke-current h-6 w-auto" />
    </div>
  </PageLayout>
);

export default Main;
