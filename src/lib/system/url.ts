export function joinPath(base: string, path: string) {
  if (base.endsWith("/")) base = base.slice(0, -1);
  if (!path.startsWith("/")) path = `/${path}`;

  return `${base}${path}`;
}
