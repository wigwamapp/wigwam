import React from "react";

export default React.forwardRef(function SvgrComponent(props, ref) {
  return {
    $$typeof: Symbol.for("react.element"),
    type: "svg",
    ref: ref,
    key: null,
    props: Object.assign({}, props, {
      children: "",
    }),
  };
});
