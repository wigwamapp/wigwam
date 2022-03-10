import { FC, useState } from "react";
import * as Repo from "core/repo";

import Input from "app/components/elements/Input";
import NewButton from "app/components/elements/NewButton";
import { ReactComponent as PlusCircleIcon } from "app/icons/PlusCircle.svg";
import { ReactComponent as EditIcon } from "app/icons/edit.svg";

interface EditNetworkProps {
  isNew: boolean;
  className?: string;
}
const EditNetwork: FC<EditNetworkProps> = ({ isNew, className = "" }) => {
  const [nName, setNName] = useState("");
  const [rpcUrl, setRpcUrl] = useState("");
  const [chainId, setChainId] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [blockExplorer, setBlockExplorer] = useState("");
  const handleSubmit = async () => {
    await Repo.networks.add({
      chainId: isNaN(Number(chainId)) ? 0 : Number(chainId),
      type: "unknown",
      rpcUrls: [rpcUrl],
      chainTag: "",
      name: nName,
      nativeCurrency: {
        name: currencySymbol,
        symbol: currencySymbol,
        decimals: 18,
      },
      explorerUrls: [blockExplorer],
    });
    handleClear();
  };
  const handleClear = () => {
    setNName("");
    setRpcUrl("");
    setChainId("");
    setCurrencySymbol("");
    setBlockExplorer("");
  };

  return (
    <section className={className}>
      <header className="flex items-center">
        {isNew ? (
          <PlusCircleIcon width={20} className="mr-4" />
        ) : (
          <EditIcon className="mr-4" />
        )}
        <h3 className="text-brand-light text-2xl font-bold">
          {isNew ? "Add new network" : "Edit network"}
        </h3>
      </header>
      <form className="mt-7" onSubmit={handleSubmit}>
        <Input
          value={nName}
          onChange={(e) => setNName(e.currentTarget.value)}
          label="Network Name"
        />
        <Input
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.currentTarget.value)}
          className="mt-3"
          label={isNew ? "RPC URL" : "New RPC URL"}
        />
        <Input
          value={chainId}
          onChange={(e) => setChainId(e.currentTarget.value)}
          className="mt-3"
          label="Chain ID"
        />
        <Input
          value={currencySymbol}
          onChange={(e) => setCurrencySymbol(e.currentTarget.value)}
          className="mt-3"
          label="Currency symbol"
          optional
        />
        <Input
          value={blockExplorer}
          onChange={(e) => setBlockExplorer(e.currentTarget.value)}
          className="mt-3"
          label="Block explorer"
          optional
        />
        <div className="mt-4">
          <NewButton theme="secondary" onClick={handleClear}>
            Cancel
          </NewButton>
          <NewButton type="submit" className="ml-4" theme="primary">
            Save
          </NewButton>
        </div>
      </form>
    </section>
  );
};

export default EditNetwork;
