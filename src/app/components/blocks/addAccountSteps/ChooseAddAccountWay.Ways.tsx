import { FC } from "react";

import { StepsContext } from "app/hooks/steps";
import { AddAccountStep } from "app/defaults";
import { ReactComponent as ImportIcon } from "app/icons/AddWalletImport.svg";
import { ReactComponent as CreateIcon } from "app/icons/AddWalletCreate.svg";
import { ReactComponent as GoogleIcon } from "app/icons/AddWalletGoogle.svg";
import { ReactComponent as FacebookIcon } from "app/icons/AddWalletFacebook.svg";
import { ReactComponent as TwitterIcon } from "app/icons/AddWalletTwitter.svg";
import { ReactComponent as RedditIcon } from "app/icons/AddWalletReddit.svg";
import { ReactComponent as LedgerIcon } from "app/icons/AddWalletLedger.svg";
import { ReactComponent as TrezorIcon } from "app/icons/AddWalletTrezor.svg";

export interface WaysReturn {
  type: string;
  title: string;
  points?: {
    security: number;
    adoption: number;
  };
  tiles: {
    title: string;
    Icon?: FC<{ className?: string }>;
    action: () => void;
    soon?: boolean;
  }[];
}
[];

export const getWays = (
  hasSeedPhrase: boolean,
  { stateRef, navigateToStep }: StepsContext
): WaysReturn[] => [
  {
    type: "seed_phrase",
    title: "Seed Phrase",
    points: {
      security: 0.8,
      adoption: 0.7,
    },
    tiles: hasSeedPhrase
      ? [
          {
            title: "Add wallet",
            Icon: ImportIcon,
            action: () => {
              alert("Not implemented");
            },
          },
        ]
      : [
          {
            title: "Import",
            Icon: ImportIcon,
            action: () => {
              stateRef.current.addSeedPhraseType = "import";
              navigateToStep(AddAccountStep.AddSeedPhrase);
            },
          },
          {
            title: "Create",
            Icon: CreateIcon,
            action: () => {
              stateRef.current.addSeedPhraseType = "create";
              navigateToStep(AddAccountStep.AddSeedPhrase);
            },
          },
        ],
  },
  {
    type: "social",
    title: "Social",
    points: {
      security: 0.3,
      adoption: 0.9,
    },
    tiles: [
      {
        title: "Google",
        Icon: GoogleIcon,
        action: () => {
          alert("Not implemented");
        },
      },
      {
        title: "Facebook",
        Icon: FacebookIcon,
        action: () => {
          alert("Not implemented");
        },
      },
      {
        title: "Twitter",
        Icon: TwitterIcon,
        action: () => {
          alert("Not implemented");
        },
      },
      {
        title: "Reddit",
        Icon: RedditIcon,
        action: () => {
          alert("Not implemented");
        },
      },
    ],
  },
  {
    type: "device",
    title: "Hard device",
    points: {
      security: 0.9,
      adoption: 0.5,
    },
    tiles: [
      {
        title: "Ledger",
        Icon: LedgerIcon,
        action: () => {
          alert("Not implemented");
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
        Icon: ImportIcon,
        action: () => navigateToStep(AddAccountStep.AddPrivateKey),
      },
      {
        title: "Create Private key",
        Icon: ImportIcon,
        action: () => navigateToStep(AddAccountStep.AddPrivateKey),
      },
    ],
  },
];
