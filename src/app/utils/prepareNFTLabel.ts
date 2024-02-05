export const prepareNFTLabel = (id: string, name?: string) => {
  const preparedName = name
    ? name.endsWith(id) || name.endsWith(`#${id}`)
      ? name.replace(` #${id}`, "").replace(`#${id}`, "").replace(` ${id}`, "")
      : name
    : undefined;

  const isTrulyId = !preparedName?.includes(`#${id}`) && id?.length <= 8;

  return {
    name: preparedName,
    id: isTrulyId ? `#${id}` : undefined,
  };
};
