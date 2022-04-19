import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";

import { profileStateAtom } from "app/atoms";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import NewButton from "app/components/elements/NewButton";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";
import { ReactComponent as WelcomeArrowIcon } from "app/icons/welcome-arrow.svg";

const Welcome: FC = () => {
  const { all } = useAtomValue(profileStateAtom);

  const isInitial = useMemo(() => all.length === 1, [all]);

  return (
    <BoardingPageLayout header={!isInitial} isWelcome>
      <div className="flex flex-col items-center">
        <VigvamIcon
          className={classNames(
            "h-[2rem] w-auto absolute top-[calc(6.3vh+1rem)] right-0"
          )}
        />

        <div className="relative mt-[10vh]">
          <h1 className="mb-12 text-5xl font-bold">Welcome to vigvam</h1>
          <WelcomeArrowIcon className="absolute -right-16 top-5" />
        </div>

        <NewButton
          theme="primary-reverse"
          to={{ addAccOpened: true }}
          merge
          className="w-[14rem]"
        >
          {isInitial ? "Get started" : "Add wallet"}
        </NewButton>
      </div>
    </BoardingPageLayout>
  );
};

export default Welcome;
