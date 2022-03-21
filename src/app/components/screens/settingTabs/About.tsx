import { FC } from "react";
import classNames from "clsx";

import { ReactComponent as VigvamLogo } from "app/icons/Vigvam.svg";

const About: FC = () => {
  return (
    <div className={classNames("flex flex-col", "py-3 px-4 mb-2")}>
      <h3 className="font-bold leading-none text-base mb-4">Vigvam version</h3>
      <div className="text-brand-font font-bold text-xl">10.4.1</div>
      <p className="text-brand-font text-sm mt-[2.188rem] mb-[2.063rem]">
        Vigvam lets you to explore DeFi and NFTs in safer, faster and modern
        way.
      </p>
      <h3 className="font-bold leading-none text-base mb-4">Links</h3>
      {linksBefore.map((props) => (
        <Link key={props.label} {...props} />
      ))}
      <div className="h-px w-[4.438rem] my-2 bg-brand-main/10"></div>
      {linksAfter.map((props) => (
        <Link key={props.label} {...props} />
      ))}
      <div className="flex items-center mt-12">
        <VigvamLogo className="w-[3.25rem] h-8" />
        <h1 className="text-2xl font-black ml-4">Vigvam</h1>
      </div>
    </div>
  );
};

const linksBefore = [
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

const linksAfter = [
  {
    label: "Visit our Support Center",
    href: "https://google.com",
  },
  {
    label: "Visit our web site",
    href: "https://google.com",
  },
  {
    label: "Contact us",
    href: "https://google.com",
  },
];

type LinkProps = {
  label: string;
  href: string;
};

const Link: React.FC<LinkProps> = ({ label, href }) => (
  <a
    target="_blank"
    rel="nofollow noreferrer"
    href={href}
    className={classNames("py-2", "text-base text-brand-font")}
  >
    {label}
  </a>
);

export default About;
