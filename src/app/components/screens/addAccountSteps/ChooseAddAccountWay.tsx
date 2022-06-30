import { FC, memo, useCallback, useEffect, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai";
import { ethers } from "ethers";
import { toProtectedString } from "lib/crypto-utils";
import { assert } from "lib/system/assert";

import { AccountSource, SocialProvider } from "core/types";
import { add0x } from "core/common";

import { hasSeedPhraseAtom } from "app/atoms";
import { TippySingletonProvider } from "app/hooks";
import { useSteps } from "app/hooks/steps";
import { LoadingHandler, useDialog } from "app/hooks/dialog";
import { AddAccountStep } from "app/nav";
import { withHumanDelay } from "app/utils";
import Collapse from "app/components/elements/Collapse";
import Tooltip from "app/components/elements/Tooltip";
import TooltipIcon from "app/components/elements/TooltipIcon";
import LargeSpinner from "app/components/elements/LargeSpinner";
import AddAccountHeader from "app/components/blocks/AddAccountHeader";
import { ReactComponent as VerifiedIcon } from "app/icons/verified.svg";
import { ReactComponent as BackgroundIcon } from "app/icons/button-full-screen-background.svg";

import { getWays, WaysReturnTile } from "./ChooseAddAccountWay.Ways";

const ChooseAddAccountWay = memo(() => {
  const hasSeedPhrase = useAtomValue(hasSeedPhraseAtom);

  const stepsCtx = useSteps();
  const sections = useMemo(
    () => getWays(hasSeedPhrase, stepsCtx),
    [hasSeedPhrase, stepsCtx]
  );

  useEffect(() => {
    stepsCtx.stateRef.current = {};
  }, [stepsCtx.stateRef]);

  return (
    <>
      <AddAccountHeader className="mb-11">Add wallet</AddAccountHeader>

      <div className="flex">
        <TippySingletonProvider>
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
                <div className="flex items-center mb-5">
                  <h2 className={classNames("text-2xl font-bold capitalize")}>
                    {section.title}
                  </h2>
                  {section.tooltip && (
                    <Tooltip
                      content={
                        <>
                          {section.tooltip.content}
                          {section.points && (
                            <Points
                              adoption={section.points.adoption}
                              security={section.points.security}
                            />
                          )}
                        </>
                      }
                      size="large"
                      className="ml-2"
                    >
                      <TooltipIcon />
                    </Tooltip>
                  )}
                </div>
                <div
                  className={classNames("flex flex-wrap items-stretch -mb-5")}
                >
                  {section.disabled && (
                    <div
                      className={classNames(
                        "-mt-4 mb-4 w-full",
                        "text-xs text-brand-redtwo"
                      )}
                    >
                      Not yet supported in this browser.
                    </div>
                  )}

                  {section.tiles.map(
                    ({ title, Icon, action, openLoginMethod, soon }, i) => (
                      <Tile
                        key={i}
                        title={title}
                        Icon={Icon}
                        action={action}
                        openLoginMethod={openLoginMethod}
                        soon={soon}
                        className={classNames(
                          "mb-5 select-none",
                          i % 3 !== 2 && "mr-5",
                          section.disabled && "opacity-50 pointer-events-none"
                        )}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
        </TippySingletonProvider>
      </div>

      {sections
        .filter(({ type }) => type === "advanced")
        .map((section, index) => (
          <Collapse
            key={index}
            label={section.title}
            className="mt-20 mx-[1.75rem] w-full"
            triggerClassName="!mb-0"
          >
            <div className={classNames("flex flex-wrap items-stretch pt-5")}>
              {section.tiles.map(
                ({ title, Icon, action, openLoginMethod, soon }, i) => (
                  <Tile
                    key={i}
                    title={title}
                    Icon={Icon}
                    action={action}
                    openLoginMethod={openLoginMethod}
                    soon={soon}
                    className="mr-5"
                  />
                )
              )}
            </div>
          </Collapse>
        ))}
    </>
  );
});

export default ChooseAddAccountWay;

type TileProps = WaysReturnTile & {
  className?: string;
};

const Tile: FC<TileProps> = ({ action, openLoginMethod, ...rest }) => {
  if (action) {
    return <TileSimple action={action} {...rest} />;
  }

  if (openLoginMethod) {
    return <TileOpenLogin openLoginMethod={openLoginMethod} {...rest} />;
  }

  return <WarningMessage>{rest.title}</WarningMessage>;
};

type TileOpenLoginProps = Omit<WaysReturnTile, "action" | "openLoginMethod"> & {
  openLoginMethod: SocialProvider;
  className?: string;
};

const TileOpenLogin: FC<TileOpenLoginProps> = ({
  openLoginMethod,
  ...rest
}) => {
  const { navigateToStep, stateRef } = useSteps();
  const { waitLoading } = useDialog();

  const handleConnect = useCallback<LoadingHandler>(
    ({ onClose }) =>
      withHumanDelay(async () => {
        try {
          let closed = false;
          onClose(() => (closed = true));

          const {
            default: OpenLogin,
            UX_MODE,
            storeKey,
          } = await import("@toruslabs/openlogin");

          const clientId = process.env.VIGVAM_OPEN_LOGIN_CLIENT_ID;
          assert(clientId, "Client ID was not specified");

          const openlogin = new OpenLogin({
            clientId,
            network: "mainnet",
            uxMode: UX_MODE.POPUP,
            replaceUrlOnRedirect: false,
          });
          localStorage.removeItem("loglevel:http-helpers");
          localStorage.removeItem("loglevel");

          onClose(() => {
            openlogin._cleanup();
            localStorage.setItem(storeKey, JSON.stringify({}));
          });

          await openlogin.init();
          await openlogin.logout().catch(console.warn);

          if (closed) return false;

          const { privKey } = await openlogin.login({
            loginProvider: openLoginMethod,
          });
          const { email, name } = await openlogin.getUserInfo();
          await openlogin.logout().catch(console.warn);

          if (closed) return false;

          const address = ethers.utils.computeAddress(add0x(privKey));

          stateRef.current.importAddresses = [
            {
              source: AccountSource.OpenLogin,
              address,
              name: email || name,
              isDisabled: true,
              isDefaultChecked: true,
              privateKey: toProtectedString(privKey),
              social: openLoginMethod,
              socialName: name,
              socialEmail: email,
            },
          ];

          return true;
        } catch (err: any) {
          const msg = err?.message ?? "Unknown error";

          if (msg === "user closed popup") return false;

          throw new Error(msg);
        }
      }),
    [openLoginMethod, stateRef]
  );

  const handleTileClick = useCallback(() => {
    waitLoading({
      title: "Loading...",
      headerClassName: "mb-3",
      content: (
        <>
          <span className="mb-5">
            Please proceed connecting in the opened dialog.
          </span>
          <LargeSpinner />
        </>
      ),
      loadingHandler: handleConnect,
    }).then((answer) => {
      if (answer) {
        navigateToStep(AddAccountStep.VerifyToAdd);
      }
    });
  }, [handleConnect, navigateToStep, waitLoading]);

  return <Tile action={handleTileClick} {...rest} />;
};

type TileSimpleProps = Omit<WaysReturnTile, "action" | "openLoginMethod"> & {
  action: () => void;
  className?: string;
};

const TileSimple: FC<TileSimpleProps> = ({
  title,
  Icon,
  action,
  soon,
  className,
}) => (
  <button
    type="button"
    className={classNames(
      "relative",
      "flex flex-col items-center",
      "text-xs font-bold",
      "max-w-[4.5rem]",
      "transition-transform",
      !soon && "hover:scale-110 focus-visible:scale-110",
      !soon && "active:scale-95",
      soon && "cursor-default",
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

type WarningMessageProps = {
  className?: string;
};

const WarningMessage: FC<WarningMessageProps> = ({ children, className }) => (
  <div
    className={classNames(
      "relative",
      "w-full h-18 p-5 mb-[2.4375rem]",
      "flex items-center",
      "text-xs",
      "z-[25]",
      className
    )}
  >
    <VerifiedIcon className="mr-3 min-w-[1.375rem]" />
    {children}
    <BackgroundIcon
      className={classNames(
        "absolute top-0 left-0 w-full h-full",
        "bg-opacity-5",
        "-z-10"
      )}
    />
  </div>
);

type PointProps = {
  filled: number;
  style: "gray" | "green";
};

const Point: FC<PointProps> = ({ filled, style }) => (
  <div className="relative w-2 h-2 overflow-hidden rounded-[50%]">
    <div className="absolute t-0 w-2 h-2 border-solid border border-[#83819a] rounded-[50%]" />
    <div
      className={classNames(
        "absolute t-0",
        style === "green" ? "bg-[color:#4f9a5e]" : "bg-[#83819a]",
        "h-2"
      )}
      style={{ width: `${filled}%` }}
    />
  </div>
);

type PointsProps = {
  security: number;
  adoption: number;
};

const Points: FC<PointsProps> = ({ security, adoption }) => (
  <div className="mt-4">
    <div
      className={classNames("w-[125px]", "flex items-center justify-between")}
    >
      <span className="w-10 text-brand-gray">Security:</span>
      <div
        className={classNames(
          "w-[56px] ml-5",
          "overflow-hidden whitespace-nowrap",
          "flex justify-between"
        )}
      >
        <Point filled={calcWidth(security, 0)} style="gray" />
        <Point filled={calcWidth(security, 1)} style="gray" />
        <Point filled={calcWidth(security, 2)} style="gray" />
        <Point filled={calcWidth(security, 3)} style="gray" />
        <Point filled={calcWidth(security, 4)} style="gray" />
      </div>
    </div>
    <div
      className={classNames("w-[125px]", "flex items-center justify-between")}
    >
      <span className="w-10 text-brand-gray">Adoption:</span>

      <div
        className={classNames(
          "w-[56px] ml-5",
          "overflow-hidden whitespace-nowrap",
          "flex justify-between"
        )}
      >
        <Point filled={calcWidth(adoption, 0)} style="green" />
        <Point filled={calcWidth(adoption, 1)} style="green" />
        <Point filled={calcWidth(adoption, 2)} style="green" />
        <Point filled={calcWidth(adoption, 3)} style="green" />
        <Point filled={calcWidth(adoption, 4)} style="green" />
      </div>
    </div>
  </div>
);

const absToZero = (n: number) => (n < 0 ? 0 : Math.abs(n));
const calcWidth = (n: number, idx: number) =>
  absToZero(n - idx * 0.2) > 0.2
    ? 100
    : absToZero(n - idx * 0.2) > 0
    ? (n - idx * 0.2) * 500
    : 0;
