import { FC } from "react";
import classNames from "clsx";
import * as SwitchPrimitive from "@radix-ui/react-switch";

interface SwitcherProps {
  label: string;
  toggle: boolean;
  setToggle: (update: boolean) => void;
  className?: string;
}
const Switcher: FC<SwitcherProps> = ({
  label,
  toggle,
  setToggle,
  className = "",
}) => (
  <div
    role="button"
    className={classNames(
      "flex items-center justify-between",
      "py-[9px] px-5",
      "bg-brand-main/[.05]",
      "rounded-[.625rem]",
      className
    )}
    tabIndex={0}
    onKeyPress={() => 0}
    onClick={() => setToggle(!toggle)}
  >
    <h6 className="text-sm font-bold">{label}</h6>
    <SwitchPrimitive.Switch
      id={label}
      className={classNames(
        "relative",
        "w-[43px] h-[26px]",
        "rounded-full",
        "[-webkit-tap-highlight-color: transparent]",
        "border border-brand-light",
        "[box-shadow: 0 0 0 2px white]",
        !toggle ? "bg-brand-main/[.05]" : "bg-brand-main/20"
      )}
      checked={toggle}
      onCheckedChange={setToggle}
    >
      <SwitchPrimitive.SwitchThumb
        className={classNames(
          "block",
          "w-[18px] h-[18px]",
          "rounded-full",
          "bg-brand-light",
          "[box-shadow: 0 2px 2px #222222]",
          "duration-100 translate-x-[4px]",
          "bg-brand-white",
          toggle && "translate-x-[20px]"
        )}
      />
    </SwitchPrimitive.Switch>
  </div>
);

export default Switcher;
