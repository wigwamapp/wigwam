import { FC, ReactNode } from "react";

import { SocialProvider } from "core/types";

import { StepsContext } from "app/hooks/steps";
import { AddAccountStep } from "app/nav";
import { ReactComponent as ImportIcon } from "app/icons/AddWalletImport.svg";
import { ReactComponent as CreateIcon } from "app/icons/AddWalletCreate.svg";
import { ReactComponent as AddNewIcon } from "app/icons/AddWalletAddNew.svg";
import { ReactComponent as GoogleIcon } from "app/icons/AddWalletGoogle.svg";
import { ReactComponent as FacebookIcon } from "app/icons/AddWalletFacebook.svg";
import { ReactComponent as TwitterIcon } from "app/icons/AddWalletTwitter.svg";
import { ReactComponent as RedditIcon } from "app/icons/AddWalletReddit.svg";
import { ReactComponent as LedgerIcon } from "app/icons/AddWalletLedger.svg";
import { ReactComponent as TrezorIcon } from "app/icons/AddWalletTrezor.svg";
import { ReactComponent as PrivateKeyIcon } from "app/icons/AddWalletPrivateKey.svg";
import { ReactComponent as WatchOnlyIcon } from "app/icons/AddWalletWatchOnly.svg";

export type WaysReturnTile = {
  title: string;
  Icon?: FC<{ className?: string }>;
  action?: () => void;
  openLoginMethod?: SocialProvider;
  soon?: boolean;
};

type WaysReturn = {
  type: string;
  title: string;
  tooltip?: {
    content: ReactNode;
  };
  points?: {
    security: number;
    adoption: number;
  };
  tiles: WaysReturnTile[];
}[];

export const getWays = (
  hasSeedPhrase: boolean,
  { stateRef, navigateToStep }: StepsContext
): WaysReturn => [
  {
    type: "seed_phrase",
    title: "Secret Phrase",
    tooltip: {
      content: (
        <>
          <p>
            <strong>Secret Phrase</strong> is a 12-word or 24-word phrase that
            is the “master key” to your wallets and funds.
            <br />
          </p>

          <p className="mt-2">
            Once created, you will need to make a backup copy of this phrase.
            Options:
          </p>

          <ul className="mt-1 list-disc list-inside">
            <li>Save in a password manager.</li>
            <li>Encrypt manually and save to any cloud.</li>
            <li>Write down and store in multiple places.</li>
          </ul>
          <p className="mt-2">
            <strong>Never, ever share</strong> your Secret Phrase, not even with
            Vigvam!
          </p>
        </>
      ),
    },
    points: {
      security: 0.8,
      adoption: 0.68,
    },
    tiles: hasSeedPhrase
      ? [
          {
            title:
              "You already have Secret Phrase, and wallets belonging to it.",
          },
          {
            title: "Add new",
            Icon: AddNewIcon,
            action: () => {
              navigateToStep(AddAccountStep.SelectAccountsToAddMethod);
            },
          },
        ]
      : [
          {
            title: "Import",
            Icon: ImportIcon,
            action: () => {
              stateRef.current.addSeedPhraseType = "import";
              navigateToStep(AddAccountStep.ImportSeedPhrase);
            },
          },
          {
            title: "Create",
            Icon: CreateIcon,
            action: () => {
              stateRef.current.addSeedPhraseType = "create";
              navigateToStep(AddAccountStep.CreateSeedPhrase);
            },
          },
        ],
  },
  {
    type: "social",
    title: "Social",
    tooltip: {
      content: (
        <>
          <p>
            A new experimental way to add wallets directly linked to your
            existing social media accounts!
          </p>

          <p className="mt-2">
            Powered by{" "}
            <a
              href="https://openlogin.com/"
              target="_blank"
              rel="nofollow noreferrer"
              className="underline"
            >
              OpenLogin
            </a>
            . Is a plug n play auth suite that combines the simplicity of
            passwordless authentication with the security of non-custodial
            public key infrastructure (PKI).
          </p>

          {/* <p className="mt-2">
            <strong>Attention!</strong> If you lose access to your social
            account or it gets blocked - you cannot regain access to your
            wallet.
          </p> */}
        </>
      ),
    },
    points: {
      security: 0.3,
      adoption: 0.9,
    },
    tiles: [
      {
        title: "Google",
        Icon: GoogleIcon,
        openLoginMethod: "google",
      },
      {
        title: "Facebook",
        Icon: FacebookIcon,
        openLoginMethod: "facebook",
      },
      {
        title: "Twitter",
        Icon: TwitterIcon,
        openLoginMethod: "twitter",
      },
      {
        title: "Reddit",
        Icon: RedditIcon,
        openLoginMethod: "reddit",
      },
    ],
  },
  {
    type: "device",
    title: "Hard device",
    tooltip: {
      content: (
        <>
          <p>
            <strong>Connect</strong> your existing hardware wallet directly to
            Vigvam. And use all the power of the available interfaces from
            Vigvam and the security of an external crypto device!
          </p>
          <p className="mt-2">
            A <strong>Hardware device</strong> is a wallet which stores your
            private keys (critical piece of information used to authorise
            outgoing transactions on the blockchain network) in a secure
            hardware.
          </p>
        </>
      ),
    },
    points: {
      security: 0.9,
      adoption: 0.5,
    },
    tiles: [
      {
        title: "Ledger",
        Icon: LedgerIcon,
        action: () => {
          stateRef.current.hardDevice = "ledger";
          navigateToStep(AddAccountStep.SelectAccountsToAddMethod);
        },
      },
      {
        title: "Trezor",
        Icon: TrezorIcon,
        soon: true,
        action: () => {
          alert("Not implemented");
        },
      },
    ],
  },
  {
    type: "advanced",
    title: "Advanced",
    tiles: [
      {
        title: "Import Private key",
        Icon: PrivateKeyIcon,
        action: () => {
          navigateToStep(AddAccountStep.ImportPrivateKey);
        },
      },
      {
        title: "Watch-only account",
        Icon: WatchOnlyIcon,
        action: () => {
          navigateToStep(AddAccountStep.AddWatchOnlyAccount);
        },
      },
    ],
  },
];
