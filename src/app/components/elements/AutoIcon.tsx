import { FC, HTMLAttributes, memo, RefObject, useRef } from "react";
import classNames from "clsx";
import memoize from "mem";
import Avatar from "boring-avatars";
import { createAvatar } from "@dicebear/core";
import { create as createPrng } from "@dicebear/core/lib/utils/prng";
import * as avataaarsStyle from "@dicebear/avataaars";
import * as personasStyle from "@dicebear/personas";
import useResizeObserver from "use-resize-observer";

import niceColorPalettes from "fixtures/niceColorPalettes/200.json";

type Source = "dicebear" | "boring";
type DicebearStyleType = "avataaars" | "personas";
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
  initialsScale?: number;
  initialsPlaceholder?: boolean;
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
    initialsScale,
    initialsPlaceholder,
    className,
    source = "dicebear",
    type = "avataaars",
    variant,
    colors,
    autoColors,
    square,
    ...rest
  }) => {
    const rootRef = useRef<HTMLDivElement>(null);

    return (
      <div
        ref={rootRef}
        className={classNames(
          "inline-flex items-center justify-center relative",
          "overflow-hidden",
          className,
        )}
        {...rest}
        {...(source === "boring"
          ? {
              children: (
                <>
                  {initialsSource && (
                    <Initials
                      rootRef={rootRef}
                      source={initialsSource}
                      scale={initialsScale}
                      placeholder={initialsPlaceholder}
                    />
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
    );
  },
);

export default AutoIcon;

const loadDicebearIconSvg = memoize(generateDicebearIconSvg, {
  cacheKey: ([t, s]) => `${t}_${s}`,
});

function generateDicebearIconSvg(type: DicebearStyleType, seed: string) {
  switch (type) {
    case "avataaars":
      return createAvatar(avataaarsStyle, {
        seed,
        mouth: [
          "default",
          "disbelief",
          "eating",
          "grimace",
          "screamOpen",
          "serious",
          "smile",
          "tongue",
          "twinkle",
        ],
      }).toString();

    case "personas":
      return createAvatar(personasStyle, {
        seed,
      }).toString();

    default:
      throw new Error("Unhandled AutoIcon type");
  }
}

type InitialsProps = {
  rootRef: RefObject<HTMLElement>;
  source: string;
  scale?: number;
  placeholder?: boolean;
};

const Initials: FC<InitialsProps> = ({
  rootRef,
  source,
  scale = 0.4,
  placeholder,
}) => {
  const { width: size } = useResizeObserver({ ref: rootRef });

  return size ? (
    <>
      {placeholder && (
        <span className="absolute inset-0">
          <svg
            viewBox="0 0 90 90"
            fill="none"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <mask
              id="mask__initials"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="90"
              height="90"
            >
              <rect width="90" height="90" rx="180" fill="#FFFFFF"></rect>
            </mask>
            <g mask="url(#mask__initials)">
              <circle cx="45" cy="45" r="27" fill="#11142D"></circle>
            </g>
          </svg>
        </span>
      )}

      <span
        className={classNames(
          "absolute top-1/2 left-1/2",
          "-translate-x-1/2 -translate-y-1/2",
          "uppercase leading-[0px] font-bold drop-shadow-profileinitial",
        )}
        style={{
          fontSize: Math.floor(size * scale),
        }}
      >
        {getInitials(source)}
      </span>
    </>
  ) : null;
};

const seedToColors = memoize((seed: string) => {
  const prng = createPrng(seed);

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
