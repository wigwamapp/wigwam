import { memo, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai/utils";
import { useSteps } from "lib/use-steps";

import { hasSeedPhraseAtom } from "app/atoms";
import { WalletStep } from "app/defaults";

const ChooseAddAccountWay = memo(() => {
  const hasSeedPhrase = useAtomValue(hasSeedPhraseAtom);

  const { navigateToStep } = useSteps();
  const sections = useMemo(() => getSections(hasSeedPhrase), [hasSeedPhrase]);

  return (
    <div className="mb-8 w-full mx-auto max-w-md flex flex-col">
      {sections.map((section) => (
        <div key={section.type} className="py-8">
          <h2
            className={classNames(section.points ? "mb-2" : "mb-6", "text-2xl")}
          >
            {section.title}
          </h2>

          {section.points && (
            <div className="mb-4 flex items-center text-sm text-gray-300">
              <span className="mr-6">
                Security: {section.points.security * 100}%
              </span>
              <span className="mr-6">
                Adoption: {section.points.adoption * 100}%
              </span>
            </div>
          )}

          <div className={classNames("-mx-4", "flex flex-wrap items-stretch")}>
            {section.tiles.map(({ toStep, title }, i) => (
              <div key={`${toStep}_${i}`} className="p-4">
                <button
                  className={classNames(
                    "p-4",
                    "flex flex-col items-center",
                    "border",
                    "border-white hover:bg-white hover:bg-opacity-5",
                    "text-lg font-semibold"
                  )}
                  onClick={() => navigateToStep(toStep)}
                >
                  {title}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default ChooseAddAccountWay;

const getSections = (hasSeedPhrase: boolean) => [
  {
    type: "seed_phrase",
    title: "From Seed Phrase",
    points: {
      security: 0.8,
      adoption: 0.7,
    },
    tiles: hasSeedPhrase
      ? [
          {
            toStep: WalletStep.AddHDAccounts,
            title: "Add wallet",
          },
        ]
      : [
          {
            toStep: WalletStep.CreateSeedPhrase,
            title: "Create new",
          },
          { toStep: WalletStep.ImportSeedPhrase, title: "Import existing" },
        ],
  },
  {
    type: "device",
    title: "Device (hardware)",
    points: {
      security: 0.9,
      adoption: 0.5,
    },
    tiles: [
      {
        toStep: WalletStep.AddLedgerAccounts,
        title: "Ledger",
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
        toStep: WalletStep.AddOpenLoginAccount,
        stepsState: {
          socialProvider: "twitter",
        },
        title: "Twitter",
      },
      {
        toStep: WalletStep.AddOpenLoginAccount,
        stepsState: {
          socialProvider: "google",
        },
        title: "Google",
      },
      {
        toStep: WalletStep.AddOpenLoginAccount,
        stepsState: {
          socialProvider: "facebook",
        },
        title: "Facebook",
      },
    ],
  },
  {
    type: "advanced",
    title: "Advanced",
    tiles: [
      {
        toStep: WalletStep.AddByPrivateKeyAccount,
        title: "By Private key",
      },
    ],
  },
];
