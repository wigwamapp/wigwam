import { FC } from "react";
import classNames from "clsx";
import { getPublicURL } from "lib/ext/utils";

import NewButton from "app/components/elements/NewButton";
import IconedButton from "app/components/elements/IconedButton";
import { ReactComponent as VigvamLogo } from "app/icons/Vigvam.svg";
import { ReactComponent as TelegramIcon } from "app/icons/telegram.svg";
import { ReactComponent as GithubIcon } from "app/icons/github.svg";
import { ReactComponent as TwitterIcon } from "app/icons/twitter.svg";
import { ReactComponent as ExternalLinkIcon } from "app/icons/external.svg";
import BaseProvider from "./BaseProvider";

const SocialLinks = [
  {
    Icon: TelegramIcon,
    href: "https://t.me/vigvamapp",
  },
  {
    Icon: GithubIcon,
    href: "https://github.com/vigvamapp",
  },
  {
    Icon: TwitterIcon,
    href: "https://twitter.com/VigVamApp",
  },
];

const ComingSoon: FC = () => {
  return (
    <BaseProvider>
      <div className="w-full overflow-hidden relative">
        <div
          className={classNames(
            "w-full max-w-[80.25rem] min-h-screen mx-auto py-32 px-8",
            "flex flex-col justify-center",
            "relative z-10"
          )}
        >
          <div className="flex items-center">
            <VigvamLogo className="w-[11rem] h-auto" />
            <h1 className="text-[4.375rem] font-black ml-4">Vigvam</h1>
          </div>
          <p className="mt-20 text-5xl font-bold">We are on the way!</p>
          <p className="mt-6 text-2xl mb-5 max-w-[25rem]">
            <strong>Follow</strong> to stay updated about our public Beta:
          </p>
          <div className="flex">
            {SocialLinks.map(({ Icon, href }) => (
              <IconedButton
                key={href}
                theme="secondary"
                Icon={Icon}
                href={href}
                className="w-12 h-12 rounded-[.75rem] mr-2"
                iconClassName="w-10 h-10"
              />
            ))}
            <NewButton
              theme="secondary"
              href="https://vigvam.app/"
              className="ml-6 rounded-[6.25rem] flex align-center py-[.875rem] px-8 text-xl"
            >
              vigvam.app
              <ExternalLinkIcon className="ml-4" />
            </NewButton>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-y-1/2">
          <div
            className="absolute inset-0 bg-gradient-to-l from-brand-dark/80 to-brand-dark/0"
            aria-hidden="true"
          />
          <img
            src={getPublicURL("/images/Interface.png")}
            alt="Vigvam - We are on the way!"
            className="w-[56.625rem] h-auto max-w-none"
          />
        </div>
      </div>
    </BaseProvider>
  );
};

export default ComingSoon;
