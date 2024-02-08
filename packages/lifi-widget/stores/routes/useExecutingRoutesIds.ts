import { shallow } from 'zustand/shallow';
import { useRouteExecutionStore } from './RouteExecutionStore';
import type { RouteExecution } from './types';
import { RouteExecutionStatus } from './types';

export const useExecutingRoutesIds = (address?: string) => {
  return useRouteExecutionStore(
    (state) =>
      (Object.values(state.routes) as RouteExecution[])
        .filter(
          (item) =>
            item.route.fromAddress === address &&
            (item.status === RouteExecutionStatus.Pending ||
              item.status === RouteExecutionStatus.Failed),
        )
        .sort(
          (a, b) =>
            (b?.route.steps[0].execution?.process[0].startedAt ?? 0) -
            (a?.route.steps[0].execution?.process[0].startedAt ?? 0),
        )
        .map(({ route }) => route.id),
    shallow,
  );
};

export const usePendingRoutesIds = (address?: string) => {
  try {
    return Object.values(
      JSON.parse(localStorage["li.fi-widget-routes"]).state.routes,
    ).filter((item: any) => item.route.fromAddress.toLowerCase() === address?.toLocaleLowerCase() && item.status === 1).map((item: any) => item.route.id)
  } catch {
    return []
  }
}
