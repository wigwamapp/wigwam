import { FC } from "react";

import WalletsList from "app/components/blocks/WalletsList";
import OverviewContent from "app/components/blocks/OverviewContent";

const Overview: FC = () => {
  return (
    <>
      <WalletsList />
      <OverviewContent />
    </>
  );
};

export default Overview;

// const Lal: FC = () => {
//   const currentAccount = useAtomValue(currentAccountAtom);

//   const provider = useProvider();

//   const sendEther = useCallback(
//     async (to: string, amount: string) => {
//       const res = await provider
//         .getSigner(currentAccount.address)
//         .sendTransaction({
//           to,
//           value: ethers.utils.parseEther(amount),
//         });

//       return res;
//     },
//     [provider, currentAccount.address]
//   );

//   useEffect(() => {
//     Object.assign(window, {
//       lal: {
//         sendEther,
//       },
//     });
//   }, [sendEther]);

//   return null;
// };
