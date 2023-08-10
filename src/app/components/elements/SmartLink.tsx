import { forwardRef, useCallback, MouseEventHandler } from "react";
import { isPopup as isPopupPrimitive } from "lib/ext/view";
import { Link } from "lib/navigation";
import { LinkProps } from "lib/navigation/Link";

import { openInTab } from "app/helpers";

type SmartLinkProps = LinkProps;

const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  (props, ref) => {
    const { to, merge, onClick, children, ...rest } = props;
    const isPopup = isPopupPrimitive();

    const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
      (evt) => {
        onClick?.(evt);

        if (!evt.defaultPrevented) {
          evt.preventDefault();
          openInTab(to, merge);
        }
      },
      [onClick, to, merge],
    );

    if (isPopup) {
      return (
        <a
          ref={ref}
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(evt) =>
            ["Enter", "Space"].includes(evt.code) && handleClick(evt as any)
          }
          {...rest}
        >
          {children}
        </a>
      );
    }

    return <Link ref={ref} {...props} />;
  },
);

export default SmartLink;
