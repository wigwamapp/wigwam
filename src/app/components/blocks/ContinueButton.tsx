import { memo, ButtonHTMLAttributes } from "react";
import classNames from "clsx";
import ArrowCircleRightIcon from "@heroicons/react/solid/ArrowCircleRightIcon";

import { T } from "lib/ext/react";

const ContinueButton = memo<ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, disabled, ...rest }) => (
    <div className="mt-24 flex items-center justify-center">
      <button
        className={classNames(
          "inline-flex items-center",
          "text-3xl",
          "text-gray-100",
          disabled && "opacity-50",
          "transition ease-in-out duration-300",
          !disabled && "animate-pulse hover:animate-none focus:animate-none",
          className
        )}
        {...rest}
      >
        <T i18nKey="continue" />
        <ArrowCircleRightIcon className="h-8 w-auto ml-4" />
      </button>
    </div>
  )
);

export default ContinueButton;
