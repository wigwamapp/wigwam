import { FC, useMemo } from "react";
import { useAtomValue } from "jotai";
import classNames from "clsx";

import { addAccountModalAtom, profileStateAtom } from "app/atoms";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import Button from "app/components/elements/Button";
import { ReactComponent as VigvamIcon } from "app/icons/Vigvam.svg";

const Welcome: FC = () => {
  const { all } = useAtomValue(profileStateAtom);
  const addAccOpened = useAtomValue(addAccountModalAtom);

  const isInitial = useMemo(() => all.length === 1, [all]);

  return (
    <BoardingPageLayout header={!isInitial} isWelcome>
      <div
        className={classNames(
          "flex flex-col items-center -mt-[3vh] relative z-10",
          addAccOpened
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-500",
        )}
      >
        <VigvamIcon className={classNames("w-[5rem] h-auto mb-5")} />
        <h1 className={classNames("mb-12 text-5xl font-bold text-brand-light")}>
          Welcome to Vigvam
        </h1>

        <Button
          theme="primary-reverse"
          to={{ addAccOpened: true }}
          merge
          className="w-[14rem] shadow-pulse"
        >
          {isInitial ? "Get started" : "Add wallet"}
        </Button>
      </div>
    </BoardingPageLayout>
  );
};

export default Welcome;
