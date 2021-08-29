import "./styles/index.css";

import { ReactNode, StrictMode } from "react";
import { render } from "react-dom";
import { disableOutlinesForClick } from "lib/outline-on-click";

export function mount(app: ReactNode) {
  disableOutlinesForClick();
  render(<StrictMode>{app}</StrictMode>, document.getElementById("root"));
}
