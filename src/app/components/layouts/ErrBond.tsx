import { FC, ComponentProps } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { resetResourcesErrorBoundary } from "lib/resax";

import { PublicError } from "core/common";

type ErrBondProps = Pick<ComponentProps<typeof ErrorBoundary>, "onReset">;

const ErrBond: FC<ErrBondProps> = (props) => (
  <ErrorBoundary
    onError={resetResourcesErrorBoundary}
    fallbackRender={({ error, resetErrorBoundary }) => (
      <div className="w-full h-full flex items-center justify-center">
        <div>
          <h3>There was an error!</h3>

          {error instanceof PublicError ? <p>{error.message}</p> : null}

          <button onClick={() => resetErrorBoundary()}>Try again</button>
        </div>
      </div>
    )}
    {...props}
  />
);

export default ErrBond;
