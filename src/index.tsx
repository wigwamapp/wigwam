import "./index.css";

// import "app/playground";

import { StrictMode } from "react";
import { render } from "react-dom";
import { disableOutlinesForClick } from "lib/outline-on-click";
import App from "app/components/App";

disableOutlinesForClick();

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById("root")
);
