import { FC, Suspense, useMemo, lazy } from "react";
import { useAtomValue } from "jotai";
import { match } from "ts-pattern";
import { Redirect } from "lib/navigation";

import { Page } from "app/nav";
import { pageAtom } from "app/atoms";
import MainPageLayout from "app/components/layouts/MainPageLayout";

import Overview from "./mainPages/Overview";
import Receive from "./mainPages/Receive";
import Transfer from "./mainPages/Transfer";
import Apps from "./mainPages/Apps";
import Contacts from "./mainPages/Contacts";
import Wallets from "./mainPages/Wallets";
import Settings from "./mainPages/Settings";
import OnboardingPopup from "../blocks/OnboardingPopup";

const SwapDynamic = lazy(() => import("./mainPages/Swap"));

const Main: FC = () => {
  return (
    <MainPageLayout>
      <Suspense>
        <MainPageRouter />
        <OnboardingPopup />
      </Suspense>
    </MainPageLayout>
  );
};

export default Main;

const MainPageRouter: FC = () => {
  const page = useAtomValue(pageAtom);

  return useMemo(() => matchMainPage(page), [page]);
};

function matchMainPage(page: Page) {
  return match(page)
    .with(Page.Default, () => <Overview />)
    .with(Page.Receive, () => <Receive />)
    .with(Page.Transfer, () => <Transfer />)
    .with(Page.Swap, () => <SwapDynamic />)
    .with(Page.Apps, () => <Apps />)
    .with(Page.Contacts, () => <Contacts />)
    .with(Page.Wallets, () => <Wallets />)
    .with(Page.Settings, () => <Settings />)
    .otherwise(() => <Redirect to={{ page: Page.Default }} />);
}
