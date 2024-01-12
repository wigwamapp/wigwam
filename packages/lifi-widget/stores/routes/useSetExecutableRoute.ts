import { useRouteExecutionStore } from './RouteExecutionStore';

export const useSetExecutableRoute = () => {
  return useRouteExecutionStore((state) => state.setExecutableRoute);
};

export const useGetExecutableRoute = () => {
  return useRouteExecutionStore((state) => state.routes)
}

export const useGetSelectedRoute = () => {
  return useRouteExecutionStore((state) => state.selectedRoute)
}