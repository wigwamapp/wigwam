import { forwardRef, RefObject, useCallback } from "react";
import { isPopup as isPopupPrimitive } from "lib/ext/view";
import { Link } from "lib/navigation";
import { LinkProps } from "lib/navigation/Link";

import { openInTab } from "app/helpers";

type SmartLinkProps = LinkProps;

const SmartLink = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  SmartLinkProps
>((props, ref) => {
  const { to, onClick, className, children } = props;
  const isPopup = isPopupPrimitive();

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);
      openInTab(to);
    },
    [onClick, to]
  );

  if (isPopup) {
    return (
      <button
        ref={ref as RefObject<HTMLButtonElement>}
        onClick={handleClick}
        className={className}
        type="button"
      >
        {children}
      </button>
    );
  }

  return <Link ref={ref as RefObject<HTMLAnchorElement>} {...props} />;
});

export default SmartLink;
