import { FC, useState } from "react";
import classNames from "clsx";

import { IS_FIREFOX } from "app/defaults";
import Avatar from "app/components/elements/Avatar";

type NftCardProps = {
  data: {
    img: string;
    name?: string;
    id?: string;
    count: number;
  };
};

const NftCard: FC<NftCardProps> = ({ data: { img, name, id, count } }) => {
  const [loaded, setLoaded] = useState(false);

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
          alt={name}
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
            "py-0.5 px-4",
            "rounded",
            "bg-[#07081B]/[.4]",
            "text-xs font-bold",
            "backdrop-blur-[8px]",
            IS_FIREFOX && "!bg-[#111226]"
          )}
        >
          {count}
        </span>
      </div>
      <h3 className="text-xs font-bold mt-2">{`${name ?? ""}${
        name && id ? " " : ""
      }${id ? `#${id}` : ""}`}</h3>
    </button>
  );
};

export default NftCard;
