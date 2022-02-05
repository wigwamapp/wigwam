import { atomFamily } from "jotai/utils";
import { dequal } from "dequal";
import { atomWithURLHash } from "lib/atom-utils";

import { Page } from "app/defaults";

export const pageAtom = atomWithURLHash("page", Page.Default);

export const getStepsAtom = atomFamily(
  ([namespace, fallback]: string[]) =>
    atomWithURLHash(`${namespace}_step`, fallback),
  dequal
);
