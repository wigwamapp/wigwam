import { FC, PropsWithChildren, memo, useState } from "react";
import classNames from "clsx";
import * as Accordion from "@radix-ui/react-accordion";
import { isPopup as isPopupPrimitive } from "lib/ext/view";

import { Page } from "app/nav";

import SecondaryModal, {
  SecondaryModalProps,
} from "../elements/SecondaryModal";
import SmartLink from "../elements/SmartLink";

const AttentionModal = memo<SecondaryModalProps>(({ open, onOpenChange }) => {
  const [accordionValue, setAccordionValue] = useState(
    AttentionContent[0].value,
  );

  const isPopup = isPopupPrimitive();

  return (
    <SecondaryModal
      open={open}
      onOpenChange={onOpenChange}
      className={classNames(
        isPopup ? "px-6" : "px-[4rem]",
        isPopup ? "py-6" : "py-[3rem]",
        isPopup && "max-w-[92vw] max-h-[70vh]",
        "prose prose-invert",
        isPopup && "prose-sm",
        "!block",
      )}
    >
      <Accordion.Root
        type="single"
        value={accordionValue}
        onValueChange={setAccordionValue}
        className={classNames(isPopup ? "min-h-[21.5rem]" : "min-h-[18.5rem]")}
      >
        {AttentionContent.map(({ value, header, content }) => (
          <Accordion.Item key={value} value={value}>
            <Accordion.Header>
              <Accordion.Trigger>
                <HeadingDot active={value === accordionValue}>
                  {header}
                </HeadingDot>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="leading-6">
              {content}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </SecondaryModal>
  );
});

export default AttentionModal;

const HeadingDot: FC<PropsWithChildren<{ active?: boolean }>> = ({
  children,
  active,
}) => (
  <span className="flex items-center font-bold hover:underline">
    <span className="mr-3 w-2.5 h-2.5 bg-radio rounded-full relative">
      {active && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-brand-darklight rounded-full" />
        </span>
      )}
    </span>

    <span>{children}</span>
  </span>
);

const AttentionContent = [
  {
    value: "pass",
    header: "Forgot the password",
    content: (
      <>
        <p className="mb-2">
          It is not possible to recover the current profile password. Wigwam is{" "}
          <strong>non-custodial</strong> software. The user is the only one who
          knows the password.
        </p>

        <p className="mt-2">
          To access the same wallets -{" "}
          <SmartLink to={{ page: Page.Profiles }}>add a new profile</SmartLink>,
          and restore these wallets. If you used the{" "}
          <strong>Secret Phrase</strong> to add them,{" "}
          <strong>use the same one again</strong>.
        </p>
      </>
    ),
  },
  {
    value: "seed",
    header: "Import Secret Phrase",
    content: (
      <p>
        To restore wallets with the Secret Phrase, or to start from scratch -{" "}
        <SmartLink to={{ page: Page.Profiles }}>add a new profile</SmartLink>{" "}
        and use this pharse to add new wallets.
      </p>
    ),
  },
  {
    value: "reset",
    header: "Reset the app",
    content: (
      <p>
        Wigwam does not have a built-in function to reset the application. We
        recommend using{" "}
        <SmartLink to={{ page: Page.Profiles }}>profiles</SmartLink>, but if you
        still want to reset - just reinstall the application (all profiles will
        be deleted).
      </p>
    ),
  },
];
