import { FC } from "react";
import classNames from "clsx";

import { ReactComponent as VigvamLogo } from "app/icons/Vigvam.svg";

const About: FC = () => {
  return (
    <div className={classNames("flex flex-col items-start", "pt-3 px-4")}>
      <AboutHeader>Vigvam version</AboutHeader>
      <div className="text-brand-font font-bold text-xl leading-none">
        10.4.1
      </div>
      <p className="text-brand-font text-sm mt-8 mb-10">
        Vigvam lets you to explore DeFi and NFTs in safer, faster and modern
        way.
      </p>
      <AboutHeader>Links</AboutHeader>
      <LinksBlock links={linksPolicy} />
      <hr className="w-[4.5rem] my-3 border-brand-main/[.07]" />
      <LinksBlock links={linksInformative} />
      <div className="flex items-center mt-12">
        <VigvamLogo className="w-[3.25rem] h-auto" />
        <span className="text-2xl font-black ml-4">Vigvam</span>
      </div>
    </div>
  );
};

export default About;

const AboutHeader: FC = ({ children }) => (
  <h3 className="font-bold leading-none text-base mb-4">{children}</h3>
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
      "py-1 px-2 -mx-2",
      "text-base text-brand-font",
      "transition-colors",
      "hover:text-brand-light focus-visible:text-brand-light",
      className
    )}
  >
    {label}
  </a>
);

const linksPolicy = [
  {
    label: "Privacy policy",
    href: "https://google.com",
  },
  {
    label: "Terms of Use",
    href: "https://google.com",
  },
  {
    label: "Attributions",
    href: "https://google.com",
  },
];

const linksInformative = [
  {
    label: "Visit our Support Center",
    href: "https://google.com",
  },
  {
    label: "Visit our web site",
    href: "https://vigvam.app/",
  },
  {
    label: "Contact us",
    href: "https://vigvam.app/contact",
  },
];
