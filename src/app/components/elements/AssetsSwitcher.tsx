import { FC, PropsWithChildren, useMemo } from "react";
import classNames from "clsx";
import * as Switch from "@radix-ui/react-switch";

import { ReactComponent as AssetsIcon } from "app/icons/switcher-assets.svg";
import { ReactComponent as NftsIcon } from "app/icons/switcher-nft.svg";

type ThemeType = "large" | "medium" | "small";

type AssetsSwitcherProps = Switch.SwitchProps & {
  theme?: ThemeType;
  customLabels?: [string, string];
  className?: string;
};

const AssetsSwitcher: FC<AssetsSwitcherProps> = ({
  theme = "large",
  checked,
  customLabels,
  onCheckedChange,
  className,
}) => {
  const [labelLeft, labelRight] = useMemo(() => {
    if (customLabels) {
      return customLabels;
    }

    return ["Assets", "NFTs"];
  }, [customLabels]);
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={classNames(
        "flex items-center",
        "rounded-[.625rem]",
        "bg-black/10",
        "border border-brand-main/[.05]",
        "transition-colors",
        "hover:bg-brand-main/[.05] focus-visible:bg-brand-main/[.05]",
        "p-1",
        className,
      )}
    >
      <SwitchOption
        theme={theme}
        className={classNames(
          theme === "small" && "mr-1",
          theme === "medium" && "mr-2",
          theme === "large" && "mr-2",
          !checked && "font-bold",
        )}
      >
        {theme === "small" ? (
          <AssetsIcon
            className={classNames(
              "transition-all",
              !checked && "fill-brand-light",
            )}
          />
        ) : (
          labelLeft
        )}
      </SwitchOption>
      <SwitchOption
        theme={theme}
        className={classNames(checked && "font-bold")}
      >
        {theme === "small" ? (
          <NftsIcon
            className={classNames(
              "transition-all",
              checked && "fill-brand-light",
            )}
          />
        ) : (
          labelRight
        )}
      </SwitchOption>
      <Switch.Thumb
        className={classNames(
          "absolute",
          "bg-brand-main/[.05]",
          "rounded-[.625rem]",
          "transition-transform",
          theme === "small" && "w-9 h-7",
          theme === "medium" && "w-[5.5rem] h-9 rounded-md",
          theme === "large" && "w-[8.5rem] h-10",
          theme === "small" && checked && "translate-x-10",
          theme === "medium" && checked && "translate-x-[6rem]",
          theme === "large" && checked && "translate-x-[9rem]",
        )}
      />
    </Switch.Root>
  );
};

type SwitchOptionProps = PropsWithChildren<{
  theme?: ThemeType;
  className?: string;
}>;

const SwitchOption: FC<SwitchOptionProps> = ({
  theme,
  children,
  className,
}) => (
  <span
    className={classNames(
      "px-2",
      "flex items-center justify-center",
      "text-base color-brand-light",
      theme === "small" && "w-9 h-7",
      theme === "medium" && "w-[5.5rem] py-[0.3rem]",
      theme === "large" && "w-[8.5rem] py-2",
      className,
    )}
  >
    {children}
  </span>
);

export default AssetsSwitcher;
