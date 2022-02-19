import { FC, HTMLAttributes, memo } from "react";
import classNames from "clsx";
import memoize from "mem";
import Avatar from "boring-avatars";
import { createAvatar, utils } from "@dicebear/avatars";
import * as jdenticonStyle from "@dicebear/avatars-jdenticon-sprites";
import * as avataaarsStyle from "@dicebear/avatars-avataaars-sprites";
import * as personasStyle from "@dicebear/personas";

import niceColorPalettes from "fixtures/niceColorPalettes/200.json";

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
  initialsSource?: string;
  // only for Dicebear
  type?: DicebearStyleType;
  // only for Boring
  variant?: BoringVariant;
  colors?: string[];
  autoColors?: boolean;
  square?: boolean;
};

const AutoIcon: FC<AutoIconProps> = memo(
  ({
    seed,
    initialsSource,
    className,
    source = "dicebear",
    type = "jdenticon",
    variant,
    colors,
    autoColors,
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
                {initialsSource && (
                  <span
                    className={classNames(
                      "absolute top-1/2 left-1/2",
                      "-translate-x-1/2 -translate-y-1/2",
                      "uppercase font-bold drop-shadow-profileinitial",
                      "text-[300%]"
                    )}
                  >
                    {getInitials(initialsSource)}
                  </span>
                )}

                <Avatar
                  name={seed}
                  variant={variant}
                  colors={
                    colors ?? (autoColors ? seedToColors(seed) : undefined)
                  }
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

const seedToColors = memoize((seed: string) => {
  const prng = utils.prng.create(seed);

  return prng.pick(niceColorPalettes);
});

function getInitials(source: string) {
  const parts = source.split(" ");

  let initials = "";
  for (const i of [0, 1]) {
    const char = parts[i]?.charAt(0);
    if (char) initials += char;
  }

  return initials;
}
