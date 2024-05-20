import { FC, PropsWithChildren } from "react";
import classNames from "clsx";

import { ReactComponent as GithubIcon } from "app/icons/github.svg";
import { ReactComponent as TelegramIcon } from "app/icons/telegram.svg";
import { ReactComponent as TwitterIcon } from "app/icons/twitter.svg";
import { ReactComponent as MediumIcon } from "app/icons/medium.svg";
import { ReactComponent as DiscordIcon } from "app/icons/discord.svg";

import Separator from "app/components/elements/Seperator";
import { ReactComponent as WigwamLogo } from "app/icons/Wigwam.svg";

const About: FC = () => {
  return (
    <div className="flex flex-col items-start pt-3">
      <div className="flex items-center">
        <WigwamLogo className="w-[3.25rem] h-auto" />
        <span className="text-2xl font-black ml-4">Wigwam</span>
      </div>

      <p className="text-brand-font text-sm mt-6 mb-8 max-w-[20rem]">
        Wigwam lets you explore DeFi and NFTs in a safer, faster and more modern
        way.
      </p>

      <AboutHeader>Version</AboutHeader>
      <div className="mb-8 font-mono text-brand-inactivelight font-bold text-xl">
        {process.env.VERSION}
      </div>

      <AboutHeader>Useful links</AboutHeader>
      <LinksBlock links={usefulLinks} />

      <Separator className="w-[10.375rem] my-3" />

      <ul className="-mx-1 flex">
        {mediaLinks.map(({ href, label, Icon }, i) => (
          <li key={i} className="mr-1">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={classNames(
                "p-1",
                "flex justify-center items-center",
                "group",
              )}
              aria-label={label}
            >
              <Icon
                className={classNames(
                  "w-8 h-8",
                  "fill-brand-inactivelight group-hover:fill-brand-light",
                  "group-focus-visible:fill-brand-light",
                  "transition-colors ease-in-out",
                )}
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default About;

const AboutHeader: FC<PropsWithChildren> = ({ children }) => (
  <h3 className="font-bold leading-none text-base mb-3">{children}</h3>
);

type LinkPrimitive = {
  label: string;
  href: string;
};

type LinksBlockProps = {
  links: LinkPrimitive[];
};

const LinksBlock: FC<LinksBlockProps> = ({ links }) => (
  <>
    {links.map(({ href, label }, i) => (
      <Link
        key={label}
        label={label}
        href={href}
        className={classNames(i !== links.length && "mb-1")}
      />
    ))}
  </>
);

type LinkProps = LinkPrimitive & {
  className?: string;
};

const Link: FC<LinkProps> = ({ label, href, className }) => (
  <a
    target="_blank"
    rel="nofollow noreferrer"
    href={href}
    className={classNames(
      "py-[0.125rem] px-1 -mx-1 mb-1",
      "text-sm",
      "transition-colors ease-in-out",
      "text-brand-inactivelight hover:text-brand-light focus-visible:text-brand-light",
      className,
    )}
  >
    {label}
  </a>
);

const usefulLinks = [
  {
    label: "Website",
    href: "https://wigwam.app/",
  },
  {
    label: "Contact us",
    href: "https://wigwam.app/contact",
  },
  {
    label: "Help",
    href: "https://wigwam.app/help",
  },
  {
    label: "Terms of Use",
    href: "https://wigwam.app/terms",
  },
  {
    label: "Privacy policy",
    href: "https://wigwam.app/privacy",
  },
];

const mediaLinks = [
  {
    href: "https://t.me/wigwamapp",
    label: "Telegram",
    Icon: TelegramIcon,
  },
  {
    href: "https://twitter.com/wigwam_app",
    label: "Twitter",
    Icon: TwitterIcon,
  },
  {
    href: "https://wigwamapp.medium.com",
    label: "Medium",
    Icon: MediumIcon,
  },
  {
    href: "https://github.com/wigwamapp",
    label: "Github",
    Icon: GithubIcon,
  },
  {
    href: "https://discord.gg/MAG2fnSqSK",
    label: "Discord",
    Icon: DiscordIcon,
  },
];
