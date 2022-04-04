import { FC, useRef } from "react";

import AddressField from "app/components/elements/AddressField";
import { QRCodeCanvas } from "qrcode.react";

const ShareAddress: FC = () => {
  const value = "0x07a858fc699f99ddF2b186bf162Fd7f4d42F7f63";
  const ref = useRef(null);
  return (
    <div className="flex flex-col">
      <AddressField
        ref={ref}
        defaultValue={value}
        label="Wallet address"
        className="mt-5"
        readOnly
      />
      <div className="border-2 border-brand-redtwo shadow-sm m-4 w-fit">
        <QRCodeCanvas value={value} />
      </div>
    </div>
  );
};

export default ShareAddress;
