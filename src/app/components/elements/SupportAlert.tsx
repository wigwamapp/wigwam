import classNames from "clsx";
import type { FC, ReactNode } from "react";

import { ReactComponent as TelegramIcon } from "app/icons/telegram.svg";
import { ReactComponent as DiscordIcon } from "app/icons/discord.svg";

const TELEGRAM = "https://t.me/wigwamapp";
const DISCORD = "https://discord.gg/MAG2fnSqSK";
const LANDING = "https://wigwam.app/";
const TIPS = "https://wigwam.app/safety-tips";

const Title: FC<{ title?: string; className?: string }> = ({
  title,
  className,
}) => {
  return (
    <p className={classNames("text-[1.75rem] font-bold", className)}>
      {title ? title : "Need assistance?"}
    </p>
  );
};

const Content: FC<{ children?: ReactNode }> = ({ children }) => {
  if (children) {
    return children;
  }

  return (
    <div className="text-left font-medium text-base text-brand-lightgray opacity-75">
      <p>
        For any questions or support connect with us on our official support
        channels:{" "}
        <a
          className="font-semibold underline hover:text-brand-gray"
          href={TELEGRAM}
          target="_blank"
          rel="noreferrer"
          aria-label="telegram"
        >
          Telegram
        </a>
        ,{" "}
        <a
          className="font-semibold underline hover:text-brand-gray"
          href={DISCORD}
          target="_blank"
          rel="noreferrer"
          aria-label="discord"
        >
          Discord
        </a>{" "}
        or chat with us on{" "}
        <a
          className="font-semibold underline hover:text-brand-gray"
          href={LANDING}
          target="_blank"
          rel="noreferrer"
          aria-label="wigwam landing"
        >
          wigwam.app
        </a>
        . We&apos;re here to help you navigate your Web3 journey!
      </p>
      <p className="mb-4">
        Also, read our{" "}
        <a
          className="font-semibold underline hover:text-brand-gray"
          href={TIPS}
          target="_blank"
          rel="noreferrer"
          aria-label="safety tips"
        >
          safety tips
        </a>{" "}
        for protecting yourself from fake support messages.
      </p>
      <ul className="flex gap-x-1">
        <li>
          <a
            href={TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className={classNames(
              "p-1",
              "flex justify-center items-center",
              "group",
            )}
            aria-label="telegram"
          >
            <TelegramIcon
              className={classNames(
                "w-10 h-10",
                "fill-brand-inactivelight group-hover:fill-brand-light",
                "group-focus-visible:fill-brand-light",
                "transition-colors ease-in-out",
              )}
            />
          </a>
        </li>
        <li>
          <a
            href={DISCORD}
            target="_blank"
            rel="noopener noreferrer"
            className={classNames(
              "p-1",
              "flex justify-center items-center",
              "group",
            )}
            aria-label="discord"
          >
            <DiscordIcon
              className={classNames(
                "w-10 h-10",
                "fill-brand-inactivelight group-hover:fill-brand-light",
                "group-focus-visible:fill-brand-light",
                "transition-colors ease-in-out",
              )}
            />
          </a>
        </li>
      </ul>
    </div>
  );
};

export { Title, Content };
