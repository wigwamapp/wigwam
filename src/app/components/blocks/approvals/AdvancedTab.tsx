import { Dispatch, memo, SetStateAction, useCallback, useMemo } from "react";
import { ethers, Transaction } from "ethers";

import {
  formatUnits,
  parseUnits,
  prepareAmountOnChange,
} from "app/utils/txApprove";

import LongTextField from "app/components/elements/LongTextField";
import PlusMinusInput from "app/components/elements/approvals/PlusMinusInput";
import TabHeader from "app/components/elements/approvals/TabHeader";

type AdvancedTabProps = {
  originTx: Transaction;
  finalTx: Transaction;
  overrides: Partial<Transaction>;
  onOverridesChange: Dispatch<SetStateAction<Partial<Transaction>>>;
};

const AdvancedTab = memo<AdvancedTabProps>(
  ({ originTx: tx, finalTx, overrides, onOverridesChange }) => {
    const rawTx = useMemo(
      () => Transaction.from(finalTx).unsignedSerialized,
      [finalTx],
    );

    const changeValue = useCallback(
      (name: string, value: ethers.BigNumberish | null) => {
        onOverridesChange((o) => ({ ...o, [name]: value ?? "" }));
      },
      [onOverridesChange],
    );

    const fixValue = useCallback(
      (name: string, value?: string) => {
        if (!value) {
          onOverridesChange((o) => ({ ...o, [name]: null }));
        }
      },
      [onOverridesChange],
    );

    return (
      <>
        <TabHeader>Advanced settings</TabHeader>

        <PlusMinusInput
          label="Gas Limit"
          placeholder="0"
          thousandSeparator
          decimalScale={0}
          name="gasLimit"
          tooltip={
            <>
              Gas limit is the maximum units of gas you are willing to use.
              Units of gas are a multiplier to “Max priority fee” and “Max fee”.
            </>
          }
          tooltipProps={{
            size: "large",
            placement: "top",
          }}
          value={formatUnits(overrides.gasLimit ?? tx.gasLimit)}
          onChange={(e) => changeValue("gasLimit", parseUnits(e.target.value))}
          onBlur={(e) => fixValue("gasLimit", e.target.value)}
          className="mb-3"
          onMinusClick={() =>
            changeValue(
              "gasLimit",
              prepareAmountOnChange({
                value: (overrides.gasLimit ?? tx.gasLimit ?? 0).toString(),
                decimals: 3,
                operator: "minus",
              }),
            )
          }
          onPlusClick={() =>
            changeValue(
              "gasLimit",
              prepareAmountOnChange({
                value: (overrides.gasLimit ?? tx.gasLimit ?? 0).toString(),
                decimals: 3,
              }),
            )
          }
        />

        <PlusMinusInput
          label="Nonce"
          placeholder="0"
          thousandSeparator
          decimalScale={0}
          name="nonce"
          tooltip={
            <>
              The nonce is the number of transactions sent from a given address.
              Each time you send a transaction, the nonce value increases by 1.
            </>
          }
          tooltipProps={{
            size: "large",
            placement: "top",
          }}
          value={formatUnits(overrides.nonce ?? tx.nonce)}
          onChange={(e) => changeValue("nonce", parseUnits(e.target.value))}
          onBlur={(e) => fixValue("nonce", e.target.value)}
          className="mb-3"
          onMinusClick={() =>
            changeValue(
              "nonce",
              prepareAmountOnChange({
                value: (overrides.nonce ?? tx.nonce ?? 0).toString(),
                decimals: 0,
                operator: "minus",
              }),
            )
          }
          onPlusClick={() =>
            changeValue(
              "nonce",
              prepareAmountOnChange({
                value: (overrides.nonce ?? tx.nonce ?? 0).toString(),
                decimals: 0,
              }),
            )
          }
        />

        <LongTextField
          label="Data"
          readOnly
          tooltip={
            <>
              The byte representation of the data that will be sent to a smart
              contract.
            </>
          }
          tooltipProps={{
            size: "large",
            placement: "top",
          }}
          value={ethers.hexlify(tx.data ?? "0x00")}
          textareaClassName="!h-36 mb-3"
        />

        <LongTextField
          label="Raw transaction"
          readOnly
          tooltip={<>The byte representation of the complete transaction.</>}
          tooltipProps={{
            size: "large",
            placement: "top",
          }}
          value={rawTx}
          textareaClassName="!h-48"
        />
      </>
    );
  },
);

export default AdvancedTab;
