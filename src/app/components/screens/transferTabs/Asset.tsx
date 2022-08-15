import { FC } from "react";

import { TokenType } from "core/types";

import TransferToken from "app/components/blocks/transfer/TokenTransfer";

const TransferAsset: FC = () => <TransferToken tokenType={TokenType.Asset} />;

export default TransferAsset;
