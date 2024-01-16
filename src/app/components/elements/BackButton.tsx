import {
  ButtonHTMLAttributes,
  memo,
  MouseEventHandler,
  useCallback,
} from "react";
import classNames from "clsx";
import { useAtom } from "jotai";
import { getPosition, goBack } from "lib/history";
import { URLHashAtom } from "lib/atom-utils";

import Button from "app/components/elements/Button";
import { ReactComponent as ArrowLeftLongIcon } from "app/icons/arrow-left-long.svg";

type BackButtonProps<T = any> = ButtonHTMLAttributes<HTMLButtonElement> & {
  navAtom: URLHashAtom<T>;
  initialValue: T;
};

const BackButton = memo(
  ({ navAtom, initialValue, className, onClick, ...rest }: BackButtonProps) => {
    const [currentValue, setCurrentValue] = useAtom(navAtom);
    const historyPosition = getPosition();

    const inHome = currentValue === initialValue;
    const canBack = !inHome;

    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
      async (evt) => {
        if (onClick) {
          await onClick(evt);
          if (evt.defaultPrevented) {
            return;
          }
        }

        switch (true) {
          case historyPosition > 0:
            goBack();
            break;

          case !inHome:
            setCurrentValue([initialValue, "replace"]);
            break;

          default:
            break;
        }
      },
      [onClick, historyPosition, initialValue, inHome, setCurrentValue],
    );

    return canBack ? (
      <Button
        theme="clean"
        onClick={handleClick}
        className={classNames("group", className)}
        {...rest}
      >
        <ArrowLeftLongIcon
          className={classNames(
            "mr-2",
            "transition-transform",
            "group-hover:-translate-x-1.5 group-focus:-translate-x-1.5",
          )}
        />
        Back
      </Button>
    ) : null;
  },
);

export default BackButton;
