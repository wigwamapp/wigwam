import {
  ButtonHTMLAttributes,
  memo,
  MouseEventHandler,
  useCallback,
} from "react";
import classNames from "clsx";
import { useAtom } from "jotai";
import { getPosition, goBack } from "lib/history";

import { Page } from "app/nav";
import { pageAtom } from "app/atoms";
import NewButton from "app/components/elements/NewButton";
import { ReactComponent as ArrowLeftLongIcon } from "app/icons/arrow-left-long.svg";

type BackButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const BackButton = memo<BackButtonProps>(({ className, onClick, ...rest }) => {
  const [page, setPage] = useAtom(pageAtom);
  const historyPosition = getPosition();

  const inHome = page === Page.Default;
  const canBack = historyPosition > 0 || !inHome;

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (evt) => {
      if (onClick) {
        onClick(evt);
        if (evt.defaultPrevented) {
          return;
        }
      }

      switch (true) {
        case historyPosition > 0:
          goBack();
          break;

        case !inHome:
          setPage([Page.Default, "replace"]);
          break;
      }
    },
    [onClick, historyPosition, inHome, setPage]
  );

  return canBack ? (
    <NewButton
      theme="clean"
      onClick={handleClick}
      className={classNames("group", className)}
      {...rest}
    >
      <ArrowLeftLongIcon
        className={classNames(
          "mr-2",
          "transition-transform",
          "group-hover:-translate-x-1.5 group-focus:-translate-x-1.5"
        )}
      />
      Back
    </NewButton>
  ) : null;
});

export default BackButton;
