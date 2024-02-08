import { FC, PropsWithChildren } from "react";
import classNames from "clsx";
import * as Switch from "@radix-ui/react-switch";

type ThemeType = "large" | "small";

type AssetsSwitcherProps = Switch.SwitchProps & {
  theme?: ThemeType;
  className?: string;
};

const AssetsSwitcher: FC<AssetsSwitcherProps> = ({
  theme = "large",
  checked,
  onCheckedChange,
  className,
}) => {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={classNames(
        "flex items-center",
        theme === "large" && "rounded-[.875rem] after:rounded-[.875rem]",
        theme === "small" && "rounded-[.625rem] after:rounded-[.625rem]",
        "bg-black/10",
        "transition-colors",
        "hover:bg-brand-main/[.05] focus-visible:bg-brand-main/[.05]",
        "p-1",
        "relative",
        "after:absolute after:inset-0 after:border after:border-brand-main/[.05] after:pointer-events-none",
        className,
      )}
    >
      <SwitchOption
        theme={theme}
        className={classNames(
          theme === "small" && "mr-1",
          theme === "large" && "mr-2",
          !checked && "font-bold",
        )}
      >
        Tokens
      </SwitchOption>
      <SwitchOption
        theme={theme}
        className={classNames(checked && "font-bold")}
      >
        NFTs
      </SwitchOption>
      <Switch.Thumb
        className={classNames(
          "absolute",
          "bg-brand-main/[.05]",
          "rounded-[.625rem]",
          "transition-transform",
          theme === "small" && "w-[6.125rem] h-8 rounded-md",
          theme === "large" && "w-[6.722rem] h-9",
          theme === "small" && checked && "translate-x-[6.375rem]",
          theme === "large" && checked && "translate-x-[7.222rem]",
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
      theme === "small" && "w-[6.125rem] py-1",
      theme === "large" && "w-[6.722rem] py-1.5",
      className,
    )}
  >
    {children}
  </span>
);

export default AssetsSwitcher;
