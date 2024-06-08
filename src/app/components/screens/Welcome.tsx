import { FC, useEffect, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import classNames from "clsx";

import { addAccountModalAtom, profileStateAtom } from "app/atoms";

import BoardingPageLayout from "app/components/layouts/BoardingPageLayout";
import Button from "app/components/elements/Button";
import { ReactComponent as WigwamIcon } from "app/icons/Wigwam.svg";

const Welcome: FC = () => {
  const { all } = useAtomValue(profileStateAtom);
  const addAccOpened = useAtomValue(addAccountModalAtom);
  const setAddAccOpened = useSetAtom(addAccountModalAtom);

  const isInitial = useMemo(() => all.length === 1, [all]);

  useEffect(() => {
    if (isInitial) {
      setAddAccOpened([true, "replace"]);
    }
  }, [isInitial, setAddAccOpened]);

  useEffect(() => {
    const t = setTimeout(() => {
      const scrollarea = document.documentElement;

      if (scrollarea) {
        scrollarea.scrollLeft =
          (scrollarea.offsetWidth - scrollarea.clientWidth) / 2;
      }
    }, 0);

    return () => clearTimeout(t);
  }, []);

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
        <WigwamIcon className={classNames("w-[5rem] h-auto mb-5")} />
        <h1
          className={classNames(
            "mb-16 text-5xl mmd:text-4xl font-bold text-brand-light",
          )}
        >
          Welcome to Wigwam
        </h1>

        <Button
          theme="primary-reverse"
          to={{ addAccOpened: true }}
          merge
          className="w-[14rem]"
        >
          {isInitial ? "Get started" : "Add wallet"}
        </Button>
      </div>
    </BoardingPageLayout>
  );
};

export default Welcome;
