import { memo, Fragment, ReactNode, useMemo, useEffect } from "react";
import useForceUpdate from "use-force-update";

import { t, getInitializing } from "./core";
import { onInited } from "./loading";
import { toList } from "./helpers";

export * from "./index";

export type ReactSubstitutions = ReactNode | ReactNode[];

export type TProps = {
  i18nKey: string;
  values?: ReactSubstitutions;
};

export const T = memo<TProps>(({ i18nKey, values, children }) => {
  const forceUpdate = useForceUpdate();
  const initializing = useMemo(() => getInitializing(), []);
  useEffect(() => {
    if (initializing) {
      onInited(forceUpdate);
    }
  }, [initializing, forceUpdate]);

  return tReact(i18nKey, values) || (children ?? null);
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
                        {k % 2 === 0 ? partK : <b>{partK}</b>}
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
