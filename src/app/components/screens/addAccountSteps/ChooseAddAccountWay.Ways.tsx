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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus dolor purus non enim praesent elementum facilisis
            leo
          </p>
          <p className="mt-2">
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus dolor purus non enim praesent elementum facilisis
            leo
          </p>
          <p className="mt-2">
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam,
            purus sit amet luctus venenatis, lectus magna fringilla urna,
            porttitor rhoncus dolor purus non enim praesent elementum facilisis
            leo
          </p>
          <p className="mt-2">
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
        Icon: ImportIcon,
        soon: true,
        action: () => {
          alert("Not implemented");
        },
      },
      {
        title: "Create Private key",
        Icon: ImportIcon,
        soon: true,
        action: () => {
          alert("Not implemented");
        },
      },
    ],
  },
];
