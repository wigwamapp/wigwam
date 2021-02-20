import React from "react";
import { ErrorBoundary } from "react-error-boundary";

type ErrBondProps = Pick<React.ComponentProps<typeof ErrorBoundary>, "onReset">;

const ErrBond: React.FC<ErrBondProps> = (props) => (
  <ErrorBoundary
    fallbackRender={({ resetErrorBoundary }) => (
      <div>
        There was an error!
        <button onClick={() => resetErrorBoundary()}>Try again</button>
      </div>
    )}
    {...props}
  />
);

export default ErrBond;
