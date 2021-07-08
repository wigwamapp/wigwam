import { memo, useEffect } from "react";
import classNames from "clsx";
import { useQuery } from "react-query";

// import { T } from "lib/ext/i18n/react";
import { hasSeedPhraseQuery } from "app/queries";

const AddAccount = memo(() => {
  const hasSeedPhrase = useQuery(hasSeedPhraseQuery).data!;

  useEffect(() => {
    console.info(hasSeedPhrase);
  }, [hasSeedPhrase]);

  return (
    <div className="my-8 flex flex-col">
      {ADD_ACCOUNT_SECTIONS.map((section) => (
        <div key={section.key} className="py-8">
          <h2>{section.title}</h2>

          <div className={classNames("flex items-stretch")}>
            {section.tiles.map(({ key, title }) => (
              <button key={key}>{title}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default AddAccount;

const ADD_ACCOUNT_SECTIONS = [
  {
    key: "seed_phrase",
    title: "From Seed Phrase",
    tiles: [
      {
        key: "create",
        title: "Create new",
      },
      {
        key: "import",
        title: "Import existing",
      },
    ],
  },
  {
    key: "advanced",
    title: "Advanced",
    tiles: [
      {
        key: "private_key",
        title: "By Private key",
      },
    ],
  },
];
