import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";

import { profileStateAtom } from "app/atoms";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import NewButton from "app/components/elements/NewButton";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";

const Welcome: FC = () => {
  const { all } = useAtomValue(profileStateAtom);

  const isInitial = useMemo(() => all.length === 1, [all]);

  return (
    <BoardingPageLayout header={!isInitial} isWelcome>
      <div className="flex flex-col items-center">
        <VigvamIcon className={classNames("w-[7.5rem] h-auto mb-5")} />
        <h1 className="mb-16 text-5xl font-bold">Welcome to vigvam</h1>

        <NewButton
          theme="primary-reverse"
          to={{ addAccOpened: true }}
          merge
          className="w-[14rem] shadow-pulse"
        >
          {isInitial ? "Get started" : "Add wallet"}
        </NewButton>
      </div>
    </BoardingPageLayout>
  );
};

export default Welcome;
