import "./index.css";

import { StrictMode } from "react";
import { render } from "react-dom";
import { disableOutlinesForClick } from "lib/outline-on-click";
import ConfirmApp from "app/components/ConfirmApp";

disableOutlinesForClick();

render(
  <StrictMode>
    <ConfirmApp />
  </StrictMode>,
  document.getElementById("root")
);
