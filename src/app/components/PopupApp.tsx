import { walletStatusQuery } from "app/queries";
import { useQuery } from "react-query";
import BaseProvider from "./BaseProvider";
import Unlock from "./pages/Unlock";
import Popup from "./pages/Popup";
import { WalletStatus } from "core/types";
import { match } from "ts-pattern";

const PopupApp: React.FC = () => (
  <BaseProvider>
    <PopupRouter />
  </BaseProvider>
);

export default PopupApp;

const PopupRouter: React.FC = () => {
  const walletStatus = useQuery(walletStatusQuery).data!;

  return match(walletStatus)
    .with(WalletStatus.Ready, () => <Popup />)
    .with(WalletStatus.Locked, () => <Unlock />)
    .otherwise(() => null);
};
