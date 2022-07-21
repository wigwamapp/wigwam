import { FC, useState } from "react";
import classNames from "clsx";

import { IS_FIREFOX } from "app/defaults";
import Avatar from "app/components/elements/Avatar";

type NftCardProps = {
  nft: {
    img?: string;
    name: string;
    id: string;
    amount: number;
  };
};

const NftCard: FC<NftCardProps> = ({ nft: { img, name, id, amount } }) => {
  const [loaded, setLoaded] = useState(false);

  const title = getNFTName("", name, id);

  return (
    <button
      className={classNames(
        "flex flex-col",
        "pt-1 px-1 pb-2",
        "text-left",
        "rounded-[.625rem]",
        "transition-colors",
        "hover:bg-[#33364A]",
        !loaded && "invisible"
      )}
    >
      <div className="relative w-full">
        <Avatar
          src={img}
          alt={title.label}
          setLoadingStatus={(status) => {
            console.log(
              "st",
              status,
              status !== "loading" && status !== "idle"
            );
            setLoaded(status !== "loading" && status !== "idle");
          }}
          className="w-full h-auto !rounded-md"
        />
        <span
          className={classNames(
            "block",
            "absolute top-1 left-1",
            "py-px px-2.5",
            "rounded",
            "bg-[#07081B]/[.4]",
            "border border-[#CCD6FF]/20",
            "text-xs font-bold",
            "backdrop-blur-[8px]",
            IS_FIREFOX && "!bg-[#111226]"
          )}
        >
          {amount}
        </span>
      </div>
      <h3 className="text-xs font-bold line-clamp-2 mt-2">{title.component}</h3>
    </button>
  );
};

export default NftCard;

const getNFTName = (contractAddress: string, name?: string, id?: string) => {
  if (!name && !id) {
    const content = `NFT - ${contractAddress}`;
    return { component: content, label: content };
  }

  return {
    component: (
      <>
        {name}
        {name && id ? " " : ""}
        {id ? <span className="text-[#ccd6ff]">#{id}</span> : ""}
      </>
    ),
    label: `${name ?? ""}${name && id ? " " : ""}${id ? `#${id}` : ""}`,
  };
};
