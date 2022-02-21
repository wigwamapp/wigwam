import { FC, ReactNode } from "react";

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
  tiles: {
    title: string;
    Icon?: FC<{ className?: string }>;
    action: () => void;
    soon?: boolean;
  }[];
}[];

export const getWays = (
  hasSeedPhrase: boolean,
  { stateRef, navigateToStep }: StepsContext
): WaysReturn => [
  {
    type: "seed_phrase",
    title: "Seed Phrase",
    tooltip: {
      content: (
        <>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus dolor purus non enim praesent elementum facilisis
            leo
          </p>
          <p className="mt-5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus
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
    tooltip: {
      content: (
        <>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus dolor purus non enim praesent elementum facilisis
            leo
          </p>
          <p className="mt-5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus
          </p>
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
    tooltip: {
      content: (
        <>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus dolor purus non enim praesent elementum facilisis
            leo
          </p>
          <p className="mt-5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus
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
        action: () => navigateToStep(AddAccountStep.AddPrivateKey),
      },
    ],
  },
];
