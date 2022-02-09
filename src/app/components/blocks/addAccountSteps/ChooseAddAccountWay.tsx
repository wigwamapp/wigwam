import { memo, useMemo } from "react";
import classNames from "clsx";
import { useAtomValue } from "jotai/utils";

import { hasSeedPhraseAtom } from "app/atoms";
import { useSteps, StepsContext } from "app/hooks/steps";
import { AddAccountStep } from "app/defaults";

const ChooseAddAccountWay = memo(() => {
  const hasSeedPhrase = useAtomValue(hasSeedPhraseAtom);

  const stepsCtx = useSteps();
  const sections = useMemo(
    () => getWays(hasSeedPhrase, stepsCtx),
    [hasSeedPhrase, stepsCtx]
  );

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
            {section.tiles.map(({ title, action }, i) => (
              <div key={i} className="p-4">
                <button
                  className={classNames(
                    "p-4",
                    "flex flex-col items-center",
                    "border",
                    "border-white hover:bg-white hover:bg-opacity-5",
                    "text-lg font-semibold"
                  )}
                  onClick={() => action()}
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

const getWays = (
  hasSeedPhrase: boolean,
  { stateRef, navigateToStep }: StepsContext
) => [
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
            title: "Add wallet",
            action: () => {
              alert("Not implemented");
            },
          },
        ]
      : [
          {
            title: "Create new",
            action: () => {
              stateRef.current.addSeedPhraseType = "create";
              navigateToStep(AddAccountStep.AddSeedPhrase);
            },
          },
          {
            title: "Import existing",
            action: () => {
              stateRef.current.addSeedPhraseType = "import";
              navigateToStep(AddAccountStep.AddSeedPhrase);
            },
          },
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
        title: "Ledger",
        action: () => {
          alert("Not implemented");
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
        title: "Twitter",
        action: () => {
          alert("Not implemented");
        },
      },
      {
        title: "Google",
        action: () => {
          alert("Not implemented");
        },
      },
      {
        title: "Facebook",
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
