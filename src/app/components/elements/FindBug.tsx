import classNames from "clsx";
import type { FC, ReactNode } from "react";

// TODO REBRANDING: update link
const ARTICLE_LINK =
  "https://ogwallet.tech/blog/find-a-bug-earn-a-reward-with-og-wallet";
const DS_CHANNEL = "https://discord.gg/MAG2fnSqSK";

const Title: FC<{ className?: string }> = ({ className }) => {
  return (
    <h1 className={classNames("text-[1.75rem] font-bold", className)}>
      Find bugs in our wallet, report and earn part of $1000+! 🎉
    </h1>
  );
};

const Content: FC<{ children?: ReactNode }> = ({ children }) => {
  if (children) {
    return children;
  }

  return (
    <div className="mb-6 flex flex-col w-full ml-6 text-left font-medium text-base text-brand-lightgray opacity-75">
      <p className="mb-3 text-lg">How do I participate in it?</p>
      <ol className="list-decimal ml-4">
        <li>Find a bug 🐞.</li>
        <li>
          Check our{" "}
          <a
            href={ARTICLE_LINK}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            participation rules.
          </a>
        </li>
        <li>
          Report to the{" "}
          <a
            href={DS_CHANNEL}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            #Bug-report channel on our Discord.
          </a>
        </li>
      </ol>
    </div>
  );
};

export { Title, Content };
