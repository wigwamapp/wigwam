import { FC, HTMLAttributes, memo } from "react";
import classNames from "clsx";
import memoize from "mem";
import { createAvatar } from "@dicebear/avatars";
import * as jdenticonStyle from "@dicebear/avatars-jdenticon-sprites";
import * as avataaarsStyle from "@dicebear/avatars-avataaars-sprites";

type StyleType = "jdenticon" | "avataaars";

type AutoIconProps = HTMLAttributes<HTMLDivElement> & {
  type?: StyleType;
  seed: string;
};

const AutoIcon: FC<AutoIconProps> = memo(
  ({ type = "jdenticon", seed, className, ...rest }) => (
    <div
      className={classNames(
        "inline-flex items-center justify-center",
        "overflow-hidden",
        className
      )}
      {...rest}
      dangerouslySetInnerHTML={{
        __html: loadIconDataUri(type, seed),
      }}
    />
  )
);

export default AutoIcon;

const loadIconDataUri = memoize(generateIconDataUri, {
  cacheKey: ([t, s]) => `${t}_${s}`,
});

function generateIconDataUri(type: StyleType, seed: string) {
  switch (type) {
    case "jdenticon":
      return createAvatar(jdenticonStyle, { seed });

    case "avataaars":
      return createAvatar(avataaarsStyle, {
        seed,
        mouth: [
          "default",
          "disbelief",
          "eating",
          "grimace",
          "scream",
          "screamOpen",
          "serious",
          "smile",
          "tongue",
          "twinkle",
        ],
      });
  }
}
