import { FC } from "react";
import classNames from "clsx";
import * as Switch from "@radix-ui/react-switch";

type AssetsSwitcherProps = Switch.SwitchProps & {
  className?: string;
};

const AssetsSwitcher: FC<AssetsSwitcherProps> = ({
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
        "rounded-[.625rem]",
        "bg-black/10",
        "border border-brand-main/[.05]",
        "p-1",
        "transition-colors",
        "hover:bg-brand-main/[.05] focus-visible:bg-brand-main/[.05]",
        className
      )}
    >
      <SwitchOption className={classNames("mr-2", !checked && "font-bold")}>
        Assets
      </SwitchOption>
      <SwitchOption className={classNames(checked && "font-bold")}>
        NFTs
      </SwitchOption>
      <Switch.Thumb
        className={classNames(
          "absolute",
          "w-[8.5rem] h-10",
          "bg-brand-main/[.05]",
          "rounded-[.625rem]",
          "transition-transform",
          checked && "translate-x-[9rem]"
        )}
      />
    </Switch.Root>
  );
};

type SwitchOptionProps = {
  className?: string;
};

const SwitchOption: FC<SwitchOptionProps> = ({ children, className }) => (
  <span
    className={classNames(
      "block w-[8.5rem] p-2",
      "text-base color-brand-light",
      className
    )}
  >
    {children}
  </span>
);

export default AssetsSwitcher;
