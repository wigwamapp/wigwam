import "./styles/index.css";

import "lib/shims/bignumberLimit";

import { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { disableOutlinesForClick } from "lib/outline-on-click";

if (
  process.env.NODE_ENV === "development" &&
  process.env.OG_DEV_ELEMENTS_SPACING === "true"
) {
  // eslint-disable-next-line
  require("spacingjs/dist/bundle");
}

disableOutlinesForClick();

export function mount(app: ReactNode) {
  const root = createRoot(document.getElementById("root")!);
  root.render(<>{app}</>);

  return () => root.unmount();
}
