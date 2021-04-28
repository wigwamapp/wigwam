import "./index.css";

// import "app/playground";

import { StrictMode } from "react";
import { render } from "react-dom";
import { enableHashRouting } from "woozie";
import { enableTrueConsole } from "lib/true-console";
import { disableOutlinesForClick } from "lib/outline-on-click";
import App from "app/components/App";

enableTrueConsole();
enableHashRouting();
disableOutlinesForClick();

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root")
);
