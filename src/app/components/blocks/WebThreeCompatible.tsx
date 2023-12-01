import { FC } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

import { MetaMaskCompatibleMode } from "core/types";

import { web3MetaMaskCompatibleAtom } from "app/atoms";
import { useSetMetaMaskCompatibleMode } from "app/hooks/web3Mode";
import { ReactComponent as OffIcon } from "app/icons/settings-mm-off.svg";
import { ReactComponent as HybridIcon } from "app/icons/settings-mm-hybrid.svg";
import { ReactComponent as StrictIcon } from "app/icons/settings-mm-strict.svg";

const compatibleModesLabels = [
  {
    value: MetaMaskCompatibleMode.Off,
    content: {
      Icon: OffIcon,
      label: "Disabled",
      description: "Wigwam will be disabled",
    },
  },
  {
    value: MetaMaskCompatibleMode.Hybrid,
    content: {
      Icon: HybridIcon,
      label: "Hybrid",
      description: "Choose while connecting",
    },
  },
  {
    value: MetaMaskCompatibleMode.Strict,
    content: {
      Icon: StrictIcon,
      label: "By Default",
      description: "Only Wigwam will be connected",
    },
  },
];

const WebThreeCompatible: FC<{ small?: boolean }> = ({ small = false }) => {
  const metamaskMode = useAtomValue(web3MetaMaskCompatibleAtom);
  const setMetamaskMode = useSetMetaMaskCompatibleMode(small ? false : true);

  return (
    <div className="flex flex-col items-start">
      {!small ? (
        <h4 className="text-lg font-bold leading-none text-brand-light mb-3">
          MetaMask compatible mode
        </h4>
      ) : null}
      <p
        className={classNames(
          "text-sm text-brand-font max-w-[30rem] mb-3",
          small ? "text-center" : "",
        )}
      >
        What wallets do you want to see when you connect to Web3 apps?
      </p>

      <ToggleGroup.Root
        className={classNames(
          "flex items-center",
          "bg-black/10",
          "border border-brand-main/5",
          "rounded-[.625rem]",
          small ? "px-1 py-1" : "px-2 py-1.5",
        )}
        type="single"
        defaultValue={MetaMaskCompatibleMode.Strict}
        value={metamaskMode}
        onValueChange={setMetamaskMode}
        aria-label="MetaMask compatible mode"
      >
        {compatibleModesLabels.map(({ value, content }, index) => (
          <ToggleItem
            key={value}
            isActive={value === metamaskMode}
            withBorder={
              metamaskMode !== MetaMaskCompatibleMode.Hybrid &&
              value !== MetaMaskCompatibleMode.Hybrid
                ? index === 0
                  ? "right"
                  : index === 2
                    ? "left"
                    : undefined
                : undefined
            }
            disabled={value === metamaskMode}
            value={value}
            content={content as any}
            aria-label={content.label}
            small={small}
            className={
              index !== compatibleModesLabels.length - 1
                ? small
                  ? "mr-0.5"
                  : "mr-1"
                : ""
            }
          />
        ))}
      </ToggleGroup.Root>
    </div>
  );
};

type ToggleItemProps = ToggleGroup.ToggleGroupItemProps & {
  isActive?: boolean;
  withBorder?: "left" | "right";
  content: {
    Icon: FC<{ className?: string }> | string;
    label: string;
    description: string;
  };
  small?: boolean;
};

const ToggleItem: FC<ToggleItemProps> = ({
  isActive = false,
  withBorder,
  content: { Icon, label, description },
  small = false,
  className,
  ...rest
}) => (
  <ToggleGroup.Item
    {...rest}
    className={classNames(
      "flex flex-col items-center text-center",
      small ? "py-2 px-0 w-[6.5rem]" : "py-3 px-4 w-[8.25rem]",
      "rounded-[.625rem]",
      "relative",
      "transition",
      isActive && "bg-brand-main/5",
      !isActive && "hover:opacity-70",
      className,
    )}
  >
    <span
      className={classNames(
        "flex items-center",
        small ? "text-xs" : "text-sm",
        "text-brand-light font-bold leading-none",
        "mb-1",
      )}
    >
      <Icon
        className={classNames(
          small ? "w-4 h-4 min-w-4 mr-1.5" : "w-5 h-5 min-w-5 mr-2",
          "fill-brand-light",
        )}
      />
      {label}
    </span>
    <span className="text-xs text-brand-font">{description}</span>
    {withBorder && !isActive ? (
      <span
        className={classNames(
          "absolute top-3",
          "h-[calc(100%-1.5rem)] w-px",
          "bg-brand-main/5",
          withBorder === "left" ? "-left-[.15625rem]" : "-right-[.15625rem]",
        )}
      />
    ) : null}
  </ToggleGroup.Item>
);

export default WebThreeCompatible;
