import { FC } from "react";
import { getPublicURL } from "lib/ext/utils";

import BaseProvider from "./BaseProvider";

const ComingSoon: FC = () => {
  return (
    <BaseProvider>
      <div className="w-full min-h-screen flex items-center justify-center">
        <img
          src={getPublicURL("icons/512.png")}
          alt=""
          className="h-36 w-36 mr-8"
        />
        <h1 className="text-4xl text-white font-semibold">Vigvam</h1>
      </div>
    </BaseProvider>
  );
};

export default ComingSoon;
