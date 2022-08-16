import "./styles/index.css";

import { ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { disableOutlinesForClick } from "lib/outline-on-click";

if (
  process.env.NODE_ENV === "development" &&
  process.env.VIGVAM_DEV_ELEMENTS_SPACING === "true"
) {
  // eslint-disable-next-line
  require("spacingjs/dist/bundle");
}

export function mount(app: ReactNode) {
  disableOutlinesForClick();

  const root = createRoot(document.getElementById("root")!);
  root.render(<StrictMode>{app}</StrictMode>);
}
