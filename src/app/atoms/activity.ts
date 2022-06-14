import { atomFamily } from "jotai/utils";
import { dequal } from "dequal/lite";
import { atomWithRepoQuery } from "lib/atom-utils";

import * as Repo from "core/repo";

export const getTokenActivityAtom = atomFamily(
  (params: Repo.QueryTokenActivitiesParams) =>
    atomWithRepoQuery((query) =>
      query(() => Repo.queryTokenActivities(params))
    ),
  dequal
);
