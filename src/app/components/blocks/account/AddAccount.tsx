import { memo, ReactNode, useEffect, useMemo } from "react";
import classNames from "clsx";
import { useQuery } from "react-query";

// import { T } from "lib/ext/i18n/react";
import { hasSeedPhraseQuery } from "app/queries";
import { useSearchParams } from "app/hooks/useSearchParams";

import AddSeedPhrase from "./AddSeedPhrase";

const AddAccount = memo(() => {
  const [tiles, setTiles] = useSearchParams<string>("tile");
  const tile = 0 in tiles ? tiles[0] : null;
  const tileNode = useMemo(() => tile && TILE_NODES[tile](), [tile]);

  const hasSeedPhrase = useQuery(hasSeedPhraseQuery).data!;

  useEffect(() => {
    console.info(hasSeedPhrase);
  }, [hasSeedPhrase]);

  return tileNode ? (
    <div className="mb-8">{tileNode}</div>
  ) : (
    <div className="mb-8 w-full mx-auto max-w-md flex flex-col">
      {SECTIONS.map((section) => (
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
            {section.tiles.map(({ key, title }) => (
              <div key={key} className="p-4">
                <button
                  className={classNames(
                    "p-4",
                    "flex flex-col items-center",
                    "border",
                    "border-white hover:bg-white hover:bg-opacity-5",
                    "text-lg font-semibold"
                  )}
                  onClick={() => setTiles([key])}
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

export default AddAccount;

const TILE_NODES: Record<string, () => ReactNode> = {
  "seed-phrase-new": () => <AddSeedPhrase />,
  "seed-phrase-import": () => <AddSeedPhrase importExisting />,
};

const SECTIONS = [
  {
    type: "seed_phrase",
    title: "From Seed Phrase",
    points: {
      security: 0.8,
      adoption: 0.7,
    },
    tiles: [
      {
        key: "seed-phrase-new",
        title: "Create new",
      },
      { key: "seed-phrase-import", title: "Import existing" },
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
        key: "ledger",
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
        key: "social-twitter",
        title: "Twitter",
      },
      {
        key: "social-google",
        title: "Google",
      },
      {
        key: "social-facebook",
        title: "Facebook",
      },
    ],
  },
  {
    type: "advanced",
    title: "Advanced",
    tiles: [
      {
        key: "private-key",
        title: "By Private key",
      },
    ],
  },
];
