import classNamed from "lib/classnamed";

const ContentContainer = classNamed("div")<{ narrow?: boolean }>`
  w-full
  ${(p) => (p.narrow ? "max-w-3xl" : "max-w-[90rem]")}
  mx-auto
  ${(p) => (p.narrow ? "px-4" : "px-8")}
`;

export default ContentContainer;
