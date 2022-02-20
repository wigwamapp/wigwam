import { FC, ReactNode } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";

type CollapseProps = {
  label: ReactNode | string;
  onOpenChange: () => void;
};

const Collapse: FC<CollapseProps> = ({ label, onOpenChange, children }) => (
  <Collapsible.Root onOpenChange={onOpenChange}>
    <Collapsible.Trigger>{label}</Collapsible.Trigger>
    <Collapsible.Content>{children}</Collapsible.Content>
  </Collapsible.Root>
);

export default Collapse;
