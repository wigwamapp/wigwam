import { FC } from "react";
import classNames from "clsx";

import SettingsHeader from "app/components/elements/SettingsHeader";
import { ReactComponent as VigvamLogo } from "app/icons/Vigvam.svg";

const About: FC = () => {
  return (
    <div className={classNames("flex flex-col", "py-3 px-4 mb-2")}>
      <SettingsHeader className="!text-base !mb-4">
        Vigvam version
      </SettingsHeader>
      <div className="text-brand-font font-bold text-xl">10.4.1</div>
      <p className="text-brand-font text-sm mt-[35px] mb-[33px]">
        Vigvam lets you to explore DeFi and NFTs in safer, faster and modern
        way.
      </p>
      <SettingsHeader className="!text-base !mb-0.5">Links</SettingsHeader>
      <Link label="Privacy policy" href="google.com" />
      <Link label="Terms of Use" href="google.com" />
      <Link label="Attributions" href="google.com" />
      <div className="h-px w-[71px] my-2 bg-brand-main/10"></div>
      <Link label="Visit our Support Center" href="google.com" />
      <Link label="Visit our web site" href="google.com" />
      <Link label="Contact us" href="google.com" />
      <div className="flex items-center mt-12">
        <VigvamLogo className="w-[52px] h-8" />
        <h1 className="text-2xl font-black ml-4">Vigvam</h1>
      </div>
    </div>
  );
};

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
