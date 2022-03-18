import { FC, useCallback } from "react";
import { ethers } from "ethers";

const AddOpenLoginAccount: FC = () => {
  const handleConnect = useCallback(async () => {
    try {
      const { default: OpenLogin, UX_MODE } = await import(
        "@toruslabs/openlogin"
      );
      const openlogin = new OpenLogin({
        clientId: "",
        network: "mainnet",
        uxMode: UX_MODE.POPUP,
      });
      await openlogin.init();

      // await openlogin.logout();
      const { privKey } = await openlogin.login({
        // fastLogin: true,
        loginProvider: "google",
      });
      console.info(privKey);
      console.info(new ethers.Wallet(privKey).address);

      // if (openlogin.privKey) {
      //   console.info(openlogin);
      // } else {
      //   const { privKey } = await openlogin.login({
      //     fastLogin: true,
      //     loginProvider: "google",
      //     // redirectUrl: browser.runtime.getURL("main.html"),
      //   });
      //   console.info(privKey);
      // }
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className="p-8">
      <button onClick={handleConnect}>Connect Open Login</button>
    </div>
  );
};

export default AddOpenLoginAccount;
