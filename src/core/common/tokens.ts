import { TokenStandard } from "core/types";

export type ParsedTokenSlug = {
  standard: TokenStandard;
  address: string;
  id: string;
};

export function createTokenSlug({ standard, address, id }: ParsedTokenSlug) {
  return `${standard}_${address}_${id}`;
}

export function parseTokenSlug(slug: string) {
  const [standard, address, id] = slug.split("_");

  return { standard, address, id } as ParsedTokenSlug;
}
