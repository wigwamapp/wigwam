import "./index.css";

import "app/playground";

import React, { StrictMode } from "react";
import { render } from "react-dom";
import { enableHashRouting } from "woozie";
import { disableOutlinesForClick } from "lib/outline-on-click";
import App from "app/components/App";

enableHashRouting();
disableOutlinesForClick();

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root")
);
