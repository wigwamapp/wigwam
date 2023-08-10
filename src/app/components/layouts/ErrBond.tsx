import { FC, ComponentProps } from "react";
import { ErrorBoundary } from "react-error-boundary";
import classNames from "clsx";
import { isPopup } from "lib/ext/view";
import { restartApp } from "lib/ext/utils";

import { PublicError } from "core/common";

import Button from "app/components/elements/Button";
import { ReactComponent as FailedIcon } from "app/icons/warning.svg";

type ErrBondProps = Pick<ComponentProps<typeof ErrorBoundary>, "onReset">;

const ErrBond: FC<ErrBondProps> = (props) => (
  <ErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="p-6">
          <div
            className={classNames(
              "prose prose-invert",
              isPopup() && "prose-sm",
            )}
          >
            <h2 className="flex items-center">
              <FailedIcon className="h-6 w-auto mr-2" />
              There was an error
            </h2>

            <p>
              Keep calm, your funds and account are not damaged. This is a minor
              failure of the application interface.
            </p>

            <p>
              A full reboot of the application can help you. This will not erase
              your data. But you will need to unlock the profile again with a
              password.
            </p>

            {error instanceof PublicError ? (
              <>
                <h3>Error message:</h3>
                <p>{error.message}</p>
              </>
            ) : null}
          </div>

          <div className="mt-8 flex items-center">
            <Button onClick={() => resetErrorBoundary()}>Try again</Button>
            <Button
              theme="secondary"
              className="ml-4"
              onClick={() => restartApp()}
            >
              Restart app
            </Button>
          </div>
        </div>
      </div>
    )}
    {...props}
  />
);

export default process.env.NODE_ENV === "production"
  ? ErrBond
  : // eslint-disable-next-line
    require("react-error-guard/lib/DeveloperErrorBoundary").default;
