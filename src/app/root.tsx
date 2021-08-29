import "./styles/index.css";

import { ReactNode, StrictMode } from "react";
import { render } from "react-dom";
import { disableOutlinesForClick } from "lib/outline-on-click";

export function mount(app: ReactNode) {
  disableOutlinesForClick();

  render(
    <StrictMode>
      {process.env.NODE_ENV === "production"
        ? app
        : (() => {
            // eslint-disable-next-line
            const { default: Inspect } = require("inspx");
            return <Inspect>{app}</Inspect>;
          })()}
    </StrictMode>,
    document.getElementById("root")
  );
}
