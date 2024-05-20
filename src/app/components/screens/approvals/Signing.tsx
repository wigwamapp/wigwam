import {
  FC,
  lazy,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import classNames from "clsx";
import { ethers } from "ethers";
import { useAtomValue } from "jotai";
import { useCopyToClipboard } from "lib/react-hooks/useCopyToClipboard";
import {
  TypedDataUtils,
  SignTypedDataVersion,
  recoverPersonalSignature,
  recoverTypedSignature,
} from "@metamask/eth-sig-util";

import { AccountSource, SigningApproval, SigningStandard } from "core/types";
import { approveItem, TEvent, trackEvent } from "core/client";
import { useDialog } from "app/hooks/dialog";
import { useLedger } from "app/hooks/ledger";

import { allAccountsAtom } from "app/atoms";
import { withHumanDelay } from "app/utils";

import ApprovalHeader from "app/components/blocks/approvals/ApprovalHeader";
import LongTextField from "app/components/elements/LongTextField";
import Button from "app/components/elements/Button";
import ScrollAreaContainer from "app/components/elements/ScrollAreaContainer";
import { ReactComponent as SuccessIcon } from "app/icons/success.svg";
import { ReactComponent as CopyIcon } from "app/icons/copy.svg";

import ApprovalLayout from "./Layout";

const JsonView = lazy(() => import("@microlink/react-json-view"));

const { toUtf8String, hexlify, getAddress } = ethers;

type ApproveSigningProps = {
  approval: SigningApproval;
};

const ApproveSigning: FC<ApproveSigningProps> = ({ approval }) => {
  const allAccounts = useAtomValue(allAccountsAtom);

  const account = useMemo(
    () => allAccounts.find((acc) => acc.address === approval.accountAddress)!,
    [approval, allAccounts],
  );

  const { alert } = useDialog();
  const withLedger = useLedger();

  const [initialLoading, setInitialLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 500);
    return () => clearTimeout(t);
  }, [setInitialLoading]);

  const message = useMemo(() => {
    try {
      switch (approval.standard) {
        case SigningStandard.PersonalSign:
          try {
            return toUtf8String(approval.message);
          } catch {
            return approval.message;
          }

        case SigningStandard.SignTypedDataV1:
          return approval.message;

        case SigningStandard.SignTypedDataV3:
        case SigningStandard.SignTypedDataV4:
          return JSON.parse(approval.message);

        default:
          throw new Error("Unhandled Signing standard");
      }
    } catch (err) {
      console.error(err);
    }

    return null;
  }, [approval]);

  const handleApprove = useCallback(
    async (approved: boolean) => {
      setApproving(true);

      try {
        await withHumanDelay(async () => {
          if (!approved || account.source !== AccountSource.Ledger) {
            await approveItem(approval.id, { approved });
            return;
          }

          let signedMessage: string | undefined;
          let ledgerError: any;

          await withLedger(async ({ ledgerEth }) => {
            try {
              let sig;

              switch (approval.standard) {
                case SigningStandard.PersonalSign:
                  sig = await ledgerEth.signPersonalMessage(
                    account.derivationPath,
                    hexlify(approval.message).substring(2),
                  );
                  break;

                case SigningStandard.SignTypedDataV1:
                case SigningStandard.SignTypedDataV3:
                  throw new Error(
                    "Ledger: Only version 4 of typed data signing is supported",
                  );

                case SigningStandard.SignTypedDataV4:
                  let domainSeparatorHex, hashStructMessageHex;

                  try {
                    const {
                      domain,
                      types,
                      primaryType,
                      message: sanitizedMessage,
                    } = TypedDataUtils.sanitizeData(
                      JSON.parse(approval.message),
                    );

                    domainSeparatorHex = TypedDataUtils.hashStruct(
                      "EIP712Domain",
                      domain,
                      types,
                      SignTypedDataVersion.V4,
                    ).toString("hex");
                    hashStructMessageHex = TypedDataUtils.hashStruct(
                      primaryType as any,
                      sanitizedMessage,
                      types,
                      SignTypedDataVersion.V4,
                    ).toString("hex");
                  } catch {
                    throw new Error("Invalid message");
                  }

                  sig = await ledgerEth.signEIP712HashedMessage(
                    account.derivationPath,
                    domainSeparatorHex,
                    hashStructMessageHex,
                  );
                  break;

                default:
                  throw new Error("Unhandled Signing standard");
              }

              if (sig) {
                signedMessage = ethers.Signature.from({
                  v: sig.v,
                  r: "0x" + sig.r,
                  s: "0x" + sig.s,
                }).serialized;

                let addressSignedWith: string | undefined;

                switch (approval.standard) {
                  case SigningStandard.PersonalSign:
                    addressSignedWith = recoverPersonalSignature({
                      data: message,
                      signature: signedMessage,
                    });
                    break;

                  case SigningStandard.SignTypedDataV4:
                    addressSignedWith = recoverTypedSignature({
                      version: SignTypedDataVersion.V4,
                      data: message,
                      signature: signedMessage,
                    });
                    break;

                  default:
                    throw new Error("Unhandled Signing standard");
                }

                if (
                  getAddress(addressSignedWith!) !== getAddress(account.address)
                ) {
                  throw new Error(
                    "Ledger: The signature doesnt match the right address",
                  );
                }
              }
            } catch (err) {
              ledgerError = err;
            }
          });

          if (signedMessage) {
            await approveItem(approval.id, { approved, signedMessage });
          } else {
            throw ledgerError ?? new Error("Failed to sign with Ledger");
          }
        });
      } catch (err: any) {
        console.error(err);

        alert({
          title: "Error",
          content: err?.message ?? "Unknown error occured",
        });
      } finally {
        setApproving(false);
      }
    },
    [approval, account, setApproving, alert, withLedger, message],
  );

  useEffect(() => {
    trackEvent(TEvent.DappSigning);
  }, []);

  if (!message) return null;

  return (
    <ApprovalLayout
      approveText="Sign"
      onApprove={handleApprove}
      disabled={initialLoading}
      approving={approving}
      className="!pt-7"
    >
      <ApprovalHeader
        account={account}
        source={approval.source}
        signing
        className="mb-8"
      />

      <h3 className="mb-4 text-xl font-bold">
        Your signature is being requested
      </h3>

      <MessageField standard={approval.standard} message={message} />
    </ApprovalLayout>
  );
};

export default ApproveSigning;

const MessageField: FC<{ standard: SigningStandard; message: any }> = ({
  standard,
  message,
}) => {
  const { copy, copied } = useCopyToClipboard(
    typeof message === "string" ? message : JSON.stringify(message, null, 2),
  );

  const standardLabel = (
    <span className="text-xs text-brand-inactivedark2 self-end">
      {standard}
    </span>
  );

  const copyButton = (
    <Button
      theme="tertiary"
      onClick={() => copy()}
      className={classNames(
        "absolute bottom-3 right-3",
        "text-sm text-brand-light",
        "!p-0 !pr-1 !min-w-0",
        "!font-normal",
        "items-center",
      )}
    >
      {copied ? (
        <SuccessIcon className="mr-1" />
      ) : (
        <CopyIcon className="mr-1" />
      )}
      {copied ? "Copied" : "Copy"}
    </Button>
  );

  const heightClassName = "!h-[20rem]";

  return (
    <ScrollAreaContainer
      className="w-full box-content -mr-5 pr-5"
      viewPortClassName="viewportBlock pt-5"
      scrollBarClassName="pt-5 pb-0"
    >
      {typeof message === "string" ? (
        <LongTextField
          label="Message"
          readOnly
          textareaClassName={heightClassName}
          value={message}
          actions={copyButton}
          labelActions={standardLabel}
          hoverStyles={false}
        />
      ) : (
        <>
          <FieldLabel action={standardLabel}>Message</FieldLabel>

          <div className="relative w-full">
            <div
              className={classNames(
                "w-full",
                heightClassName,
                "py-3 px-4",
                "box-border",
                "text-sm text-brand-light",
                "bg-black/20",
                "border border-brand-main/10",
                "rounded-[.625rem]",
                "overflow-auto",
              )}
            >
              <JsonView
                src={message}
                theme="harmonic"
                iconStyle="triangle"
                name={null}
                indentWidth={3}
                collapsed={false}
                collapseStringsAfterLength={42}
                enableClipboard={false}
                displayObjectSize={false}
                displayDataTypes={false}
                style={{ backgroundColor: "none" }}
                sortKeys
              />
            </div>

            {copyButton}
          </div>
        </>
      )}
    </ScrollAreaContainer>
  );
};

const FieldLabel: FC<PropsWithChildren<{ action?: ReactNode }>> = ({
  children,
  action,
}) => (
  <div className="flex items-center justify-between px-4 mb-2 min-h-6">
    <div className="text-base text-brand-gray cursor-pointer flex align-center">
      {children}
    </div>

    {action && (
      <>
        <span className="flex-1" />
        {action}
      </>
    )}
  </div>
);
