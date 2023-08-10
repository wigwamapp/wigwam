import {
  memo,
  Fragment,
  ReactNode,
  PropsWithChildren,
  useMemo,
  useEffect,
} from "react";
import useForceUpdate from "use-force-update";

import { t, replaceT } from "./core";
import { onInited, isInited } from "./loading";
import { toList } from "./helpers";

export * from "./index";

export type ReactSubstitutions = ReactNode | ReactNode[];

export type TProps = {
  i18nKey: string;
  values?: ReactSubstitutions;
};

export const T = memo<PropsWithChildren<TProps>>(
  ({ i18nKey, values, children }) => {
    useI18NUpdate();
    return tReact(i18nKey, values) || (children ?? null);
  },
);

export type TReplaceProps = {
  msg: string;
};

export const TReplace = memo<TReplaceProps>(({ msg }) => {
  useI18NUpdate();
  return <>{replaceT(msg)}</>;
});

export function useI18NUpdate() {
  const forceUpdate = useForceUpdate();
  const inited = useMemo(isInited, []);

  useEffect(() => {
    if (!inited) onInited(forceUpdate);
  }, [inited, forceUpdate]);
}

const TMP_SEPARATOR = "$_$";
const BOLD_PATTERN = /<b>(.*?)<\/b>/g;

function tReact(messageName: string, substitutions?: ReactSubstitutions) {
  const subList = toList(substitutions);
  const tmp = t(
    messageName,
    subList.map(() => TMP_SEPARATOR),
  );

  return (
    <>
      {tmp.split(TMP_SEPARATOR).map((partI, i) => (
        <Fragment key={`i_${i}`}>
          {i > 0 && subList[i]}

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
        </Fragment>
      ))}
    </>
  );
}
