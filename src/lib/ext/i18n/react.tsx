import { memo } from "react";

export type TProps = {
  id?: string;
};

export const T = memo<TProps>(({ children }) => {
  return <>{children}</>;
});

export const t = (msg: string) => msg;

// TODO: Implement well i18n
