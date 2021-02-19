import "lib/inter-ui/inter.css";
import "./index.css";

import React, { StrictMode } from "react";
import { render } from "react-dom";
import App from "app/App";
import { nanoid } from "nanoid";
import { disableOutlinesForClick } from "lib/outline-on-click";

console.info(nanoid(), import.meta.env.SNOWPACK_PUBLIC_KEK);

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root")
);

disableOutlinesForClick();

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
