import { Dispatch, memo, SetStateAction, useCallback, useMemo } from "react";
import { ethers } from "ethers";

import LongTextField from "app/components/elements/LongTextField";
import PlusMinusInput from "app/components/elements/approvals/PlusMinusInput";
import TabHeader from "app/components/elements/approvals/TabHeader";
import {
  formatUnits,
  parseUnits,
  Tx,
} from "app/components/screens/approvals/Transaction";

type AdvancedTabProps = {
  originTx: Tx;
  finalTx: Tx;
  overrides: Partial<Tx>;
  onOverridesChange: Dispatch<SetStateAction<Partial<Tx>>>;
};

const AdvancedTab = memo<AdvancedTabProps>(
  ({ originTx: tx, finalTx, overrides, onOverridesChange }) => {
    const rawTx = useMemo(
      () => ethers.utils.serializeTransaction(finalTx),
      [finalTx]
    );

    const changeValue = useCallback(
      (name: string, value: ethers.BigNumberish | null) => {
        onOverridesChange((o) => ({ ...o, [name]: value }));
      },
      [onOverridesChange]
    );

    const fixValue = useCallback(
      (name: string, value?: string) => {
        if (!value) changeValue(name, null);
      },
      [changeValue]
    );

    return (
      <>
        <TabHeader tooltip="Advanced settings">Advanced settings</TabHeader>

        <PlusMinusInput
          label="Gas Limit"
          placeholder="0"
          thousandSeparator
          decimalScale={0}
          name="gasLimit"
          value={formatUnits(overrides.gasLimit ?? tx.gasLimit)}
          onChange={(e) => changeValue("gasLimit", parseUnits(e.target.value))}
          onBlur={(e) => fixValue("gasLimit", e.target.value)}
          className="mb-3"
          onMinusClick={() => undefined}
          onPlusClick={() => undefined}
        />

        <PlusMinusInput
          label="Nonce"
          placeholder="0"
          thousandSeparator
          decimalScale={0}
          name="nonce"
          value={formatUnits(overrides.nonce ?? tx.nonce)}
          onChange={(e) => changeValue("nonce", parseUnits(e.target.value))}
          onBlur={(e) => fixValue("nonce", e.target.value)}
          className="mb-3"
          onMinusClick={() => undefined}
          onPlusClick={() => undefined}
        />

        <LongTextField
          label="Data"
          readOnly
          value={ethers.utils.hexlify(tx.data ?? "0x00")}
          textareaClassName="!h-36 mb-3"
        />

        <LongTextField
          label="Raw transaction"
          readOnly
          value={rawTx}
          textareaClassName="!h-48"
        />
      </>
    );
  }
);

export default AdvancedTab;
