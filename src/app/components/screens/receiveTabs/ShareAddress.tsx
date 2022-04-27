import { FC } from "react";
import { useAtomValue } from "jotai";
import { QRCodeCanvas } from "qrcode.react";

import { currentAccountAtom } from "app/atoms";
import AddressField from "app/components/elements/AddressField";

const ShareAddress: FC = () => {
  const currentAccount = useAtomValue(currentAccountAtom);

  return (
    <div className="flex flex-col">
      <AddressField
        defaultValue={currentAccount.address}
        label="Wallet address"
        readOnly
      />
      <div className="border-2 border-brand-light rounded-xl mt-4 p-4 mr-auto">
        <QRCodeCanvas
          bgColor="#101123"
          fgColor="#F8F9FD"
          includeMargin={false}
          size={128}
          level="L"
          value={currentAccount.address}
        />
      </div>
    </div>
  );
};

export default ShareAddress;
