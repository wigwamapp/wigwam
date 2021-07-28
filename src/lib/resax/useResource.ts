import { useEffect, useRef } from "react";
import useForceUpdate from "use-force-update";

import { IResource, ResourceValue } from "./types";
import { Resource } from "./resource";

export function useResource<Resources extends any[]>(
  ...resources: Resources
): Resources extends [any]
  ? Resources[0] extends IResource
    ? ResourceValue<Resources[0]>
    : ResourceValue<Resources[0]> | null
  : {
      [Index in keyof Resources]: Resources[Index] extends IResource
        ? ResourceValue<Resources[Index]>
        : ResourceValue<Resources[Index]> | null;
    } {
  const forceUpdate = useForceUpdate();

  const promises: Promise<void>[] = [];
  const values = [];
  for (const resource of resources) {
    if (resource instanceof Resource) {
      try {
        values.push(resource.read());
      } catch (err) {
        if (err instanceof Promise) {
          promises.push(err);
        } else {
          throw err;
        }
      }
    } else {
      values.push(null);
    }
  }

  if (promises.length > 0) {
    throw Promise.all(promises);
  }

  const resourcesRef = useRef(resources);
  const resourceListenersRef = useRef(new Map<IResource, () => void>());

  useEffect(() => {
    for (const resource of resources) {
      if (
        resource instanceof Resource &&
        !resourceListenersRef.current.has(resource)
      ) {
        const unsubscribe = resource.subscribe(() => {
          if (resourcesRef.current.includes(resource)) {
            forceUpdate();
          } else {
            unsubscribe();
            resourceListenersRef.current.delete(resource);
          }
        });

        resourceListenersRef.current.set(resource, unsubscribe);
      }
    }

    resourcesRef.current = resources;
  }, [forceUpdate, resources]);

  useEffect(
    () => () => {
      for (const unsubscribe of resourceListenersRef.current.values()) {
        unsubscribe();
      }
    },
    []
  );

  return values.length === 1 ? values[0] : values;
}
