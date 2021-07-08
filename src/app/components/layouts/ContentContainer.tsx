import classNamed from "lib/classnamed";

const ContentContainer = classNamed("div")<{ narrow?: boolean }>`
  w-full
  ${(p) => (p.narrow ? "max-w-3xl" : "max-w-6xl")}
  mx-auto
  px-4
`;

export default ContentContainer;
