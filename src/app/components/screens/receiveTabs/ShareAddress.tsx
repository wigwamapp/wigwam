import { FC, useRef } from "react";
import { useAtomValue } from "jotai";
import { QRCodeCanvas } from "qrcode.react";

import AddressField from "app/components/elements/AddressField";
import { currentAccountAtom } from "app/atoms";

const ShareAddress: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);
  const ref = useRef(null);
  return (
    <div className="flex flex-col">
      <AddressField
        ref={ref}
        defaultValue={currentAccount.address}
        label="Wallet address"
        className="mt-5"
        readOnly
      />
      <div className="border-2 border-brand-redtwo shadow-sm m-4 w-fit">
        <QRCodeCanvas value={currentAccount.address} />
      </div>
    </div>
  );
};

export default ShareAddress;
