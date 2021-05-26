import "./index.css";

import { StrictMode } from "react";
import { render } from "react-dom";

import { disableOutlinesForClick } from "lib/outline-on-click";
import PopupApp from "app/components/PopupApp";

disableOutlinesForClick();

render(
  <StrictMode>
    <PopupApp />
  </StrictMode>,
  document.getElementById("root")
);
