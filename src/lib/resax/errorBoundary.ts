import { IResource } from "./types";

const erroredResources = new Set<IResource>();

export function addErroredResource(resource: IResource) {
  erroredResources.add(resource);
}

export function resetResourcesErrorBoundary() {
  for (const resource of erroredResources) {
    resource.clear();
  }
  erroredResources.clear();
}
