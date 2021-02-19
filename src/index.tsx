import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import { nanoid } from "nanoid";

import "./styles/inter.css";
import "./styles/tailwind.css";
import "./styles/base.css";

console.info(nanoid(), import.meta.env.SNOWPACK_PUBLIC_KEK);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://snowpack.dev/concepts/hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
}
