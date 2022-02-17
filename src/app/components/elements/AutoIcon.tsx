import { FC, HTMLAttributes, memo } from "react";
import classNames from "clsx";
import memoize from "mem";
import Avatar from "boring-avatars";
import { createAvatar } from "@dicebear/avatars";
import * as jdenticonStyle from "@dicebear/avatars-jdenticon-sprites";
import * as avataaarsStyle from "@dicebear/avatars-avataaars-sprites";
import * as personasStyle from "@dicebear/personas";

type Source = "dicebear" | "boring";
type DicebearStyleType = "jdenticon" | "avataaars" | "personas";
type BoringVariant =
  | "marble"
  | "beam"
  | "pixel"
  | "sunset"
  | "ring"
  | "bauhaus";

type AutoIconProps = HTMLAttributes<HTMLDivElement> & {
  seed: string;
  source?: Source;
  initials?: string;
  // only for Dicebear
  type?: DicebearStyleType;
  // only for Boring
  variant?: BoringVariant;
  colors?: string[];
  square?: boolean;
};

const AutoIcon: FC<AutoIconProps> = memo(
  ({
    seed,
    initials,
    className,
    source = "dicebear",
    type = "jdenticon",
    variant,
    colors,
    square,
    ...rest
  }) => (
    <div
      className={classNames(
        "inline-flex items-center justify-center relative",
        "overflow-hidden",
        className
      )}
      {...rest}
      {...(source === "boring"
        ? {
            children: (
              <>
                {initials && (
                  <span
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 uppercase font-bold drop-shadow-profileinitial"
                    style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)" }}
                  >
                    {initials}
                  </span>
                )}

                <Avatar
                  name={seed}
                  variant={variant}
                  colors={colors}
                  square={square}
                  size="100%"
                />
              </>
            ),
          }
        : {
            dangerouslySetInnerHTML: {
              __html: loadDicebearIconSvg(type, seed),
            },
          })}
    />
  )
);

export default AutoIcon;

const loadDicebearIconSvg = memoize(generateDicebearIconSvg, {
  cacheKey: ([t, s]) => `${t}_${s}`,
});

function generateDicebearIconSvg(type: DicebearStyleType, seed: string) {
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

    case "personas":
      return createAvatar(personasStyle, {
        seed,
      });
  }
}
