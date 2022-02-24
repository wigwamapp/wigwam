import { FC, memo, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";

import { hasSeedPhraseAtom } from "app/atoms";
import { useSteps } from "app/hooks/steps";
import Collapse from "app/components/elements/Collapse";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";

import { getWays, WaysReturnTile } from "./ChooseAddAccountWay.Ways";

const ChooseAddAccountWay = memo(() => {
  const hasSeedPhrase = useAtomValue(hasSeedPhraseAtom);

  const stepsCtx = useSteps();
  const sections = useMemo(
    () => getWays(hasSeedPhrase, stepsCtx),
    [hasSeedPhrase, stepsCtx]
  );

  return (
    <div className="mb-8 w-full max-w-[59rem] mx-auto flex flex-wrap">
      <AddAccountHeader className="mb-11">Add wallet</AddAccountHeader>

      {sections
        .filter(({ type }) => type !== "advanced")
        .map((section, index) => (
          <div
            key={section.type}
            className={classNames(
              "w-1/3",
              "px-[1.75rem]",
              index % 3 !== 2 && "border-r border-brand-light/[.03]"
            )}
          >
            <h2 className={classNames("text-2xl font-bold capitalize", "mb-5")}>
              {section.title}
            </h2>
            <div className={classNames("flex flex-wrap items-stretch -mb-5")}>
              {section.tiles.map(({ title, Icon, action, soon }, i) => (
                <Tile
                  key={i}
                  title={title}
                  Icon={Icon}
                  action={action}
                  soon={soon}
                  className={classNames("mb-5", i % 3 !== 2 && "mr-5")}
                />
              ))}
            </div>
          </div>
        ))}

      {sections
        .filter(({ type }) => type === "advanced")
        .map((section, index) => (
          <Collapse
            key={index}
            label={section.title}
            className="mt-[4.25rem] mx-[1.75rem] w-full"
            triggerClassName="!mb-5"
          >
            <div className={classNames("flex flex-wrap items-stretch")}>
              {section.tiles.map(({ title, Icon, action, soon }, i) => (
                <Tile
                  key={i}
                  title={title}
                  Icon={Icon}
                  action={action}
                  soon={soon}
                  className="mr-5"
                />
              ))}
            </div>
          </Collapse>
        ))}
    </div>
  );
});

type TileProps = WaysReturnTile & {
  className?: string;
};

const Tile: FC<TileProps> = ({ title, Icon, action, soon, className }) => (
  <button
    className={classNames(
      "relative",
      "flex flex-col items-center",
      "text-xs font-bold",
      "max-w-[4.5rem]",
      "transition-transform",
      !soon && "hover:scale-110 focus:scale-110",
      !soon && "active:scale-95",
      soon && "cursor-not-allowed",
      className
    )}
    disabled={soon}
    onClick={() => action()}
  >
    {!!Icon && <Icon className="w-[4.5rem] h-[4.5rem] mb-1" />}
    {soon && (
      <span
        className={classNames(
          "py-1 px-2",
          "rounded-md",
          "bg-brand-main/40",
          "border border-brand-main/50",
          "shadow-addaccountmodal",
          "text-xs font-medium",
          "absolute",
          "-top-3 -right-2"
        )}
      >
        Soon
      </span>
    )}
    {title}
  </button>
);

export default ChooseAddAccountWay;
