import { memo, useState } from "react";
import classNames from "clsx";

import { IS_FIREFOX } from "app/defaults";
import Avatar from "app/components/elements/Avatar";

type NftCardProps = {
  nft: {
    thumbnailUrl?: string;
    name: string;
    contractAddress: string;
    tokenId: string;
    rawBalance: string;
  };
};

const NftCard = memo<NftCardProps>(
  ({ nft: { thumbnailUrl, name, contractAddress, tokenId, rawBalance } }) => {
    const [loaded, setLoaded] = useState(false);

    const title = getNFTName(contractAddress, tokenId, name);

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
            src={thumbnailUrl}
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
            errorClassName="h-[6rem]"
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
            {rawBalance}
          </span>
        </div>
        <h3 className="text-xs font-bold mt-2">{title.component}</h3>
        {/*   line-clamp-2*/}
      </button>
    );
  }
);

export default NftCard;

const getNFTName = (contractAddress: string, id: string, name?: string) => {
  if (!name && !id) {
    const content = `NFT - ${contractAddress}`;
    return { component: content, label: content };
  }

  const isTrulyId =
    id !== "0" && id !== name && `#{id}` !== name && !name?.includes(id);

  return {
    component: (
      <>
        {name}
        {name && id ? " " : ""}
        {isTrulyId ? <span className="text-[#ccd6ff]">#{id}</span> : ""}
      </>
    ),
    label: `${name ?? ""}${name && id ? " " : ""}${isTrulyId ? `#${id}` : ""}`,
  };
};
