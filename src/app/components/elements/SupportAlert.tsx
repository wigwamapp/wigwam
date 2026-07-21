import classNames from "clsx";
import type { FC, ReactNode } from "react";
import Input from "./Input";

const TIPS = "https://ogwallet.tech/safety-tips";

const Title: FC<{ title?: string; className?: string }> = ({
  title,
  className,
}) => {
  return (
    <p className={classNames("text-[1.75rem] font-bold", className)}>
      {title ? title : "Need assistance?"}
    </p>
  );
};

const Content: FC<{ children?: ReactNode }> = ({ children }) => {
  if (children) {
    return children;
  }

  return (
    <div className="text-left font-medium text-base text-brand-lightgray opacity-75">
      <p>
        If you have trouble working with the OG extension, <br />
        please contact us via email:
      </p>
      <p className="mt-2">
        <Input
          value="info@ogwallet.tech"
          id="support-email"
          readOnly
          tabIndex={-1}
          inputClassName="!w-auto"
        />
      </p>
      <p className="mt-4">
        Attention: We do not provide assistance via Telegram, Discord, or other
        social channels—only email. We will never ask you to share your seed
        phrase (12 words) or private key. Be aware of scammers.
      </p>
      <p className="mb-4">
        Also, read our{" "}
        <a
          className="font-semibold underline hover:text-brand-gray"
          href={TIPS}
          target="_blank"
          rel="noreferrer"
          aria-label="safety tips"
        >
          safety tips
        </a>{" "}
        for protecting yourself from fake support messages.
      </p>
    </div>
  );
};

export { Title, Content };
