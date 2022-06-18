import { atomFamily } from "jotai/utils";
import { dequal } from "dequal/lite";
import { atomWithRepoQuery } from "lib/atom-utils";

import * as repo from "core/repo";

export const getTokenActivityAtom = atomFamily(
  (params: repo.QueryTokenActivitiesParams) =>
    atomWithRepoQuery((query) =>
      query(() => repo.queryTokenActivities(params))
    ),
  dequal
);

export const pendingActivityAtom = atomWithRepoQuery((query) =>
  query(() => repo.queryActivities({ pending: true }))
);

export const getActivityAtom = atomFamily(
  (params: { offset?: number; limit?: number }) =>
    atomWithRepoQuery((query) =>
      query(() => repo.queryActivities({ pending: false, ...params }))
    ),
  dequal
);
