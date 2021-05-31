import { memo, Fragment, ReactNode, useMemo } from "react";

import { t } from "./core";
import { toList } from "./helpers";

export * from "./index";

export type ReactSubstitutions = ReactNode | ReactNode[];

export type TProps = {
  i18nKey: string;
  values?: ReactSubstitutions;
};

export const T = memo<TProps>(({ i18nKey, values, children }) => {
  const message = useMemo(() => tReact(i18nKey, values), [i18nKey, values]);
  return message || (children ?? null);
});

const TMP_SEPARATOR = "$_$";
const BOLD_PATTERN = /<b>(.*?)<\/b>/g;

function tReact(messageName: string, substitutions?: ReactSubstitutions) {
  const subList = toList(substitutions);
  const tmp = t(
    messageName,
    subList.map(() => TMP_SEPARATOR)
  );

  return (
    <>
      {tmp.split(TMP_SEPARATOR).map((partI, i) => (
        <Fragment key={`i_${i}`}>
          {partI.split("\n").map((partJ, j) => (
            <Fragment key={`j_${j}`}>
              {j > 0 && <br />}
              {partJ.includes("<b>")
                ? partJ
                    .split(BOLD_PATTERN)
                    .map((partK, k) => (
                      <Fragment key={`k_${k}`}>
                        {k % 2 === 0 ? (
                          partK
                        ) : (
                          <span className="font-semibold">{partK}</span>
                        )}
                      </Fragment>
                    ))
                : partJ}
            </Fragment>
          ))}
          {subList[i]}
        </Fragment>
      ))}
    </>
  );
}
