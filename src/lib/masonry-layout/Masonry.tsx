import React, {
  Children,
  cloneElement,
  ComponentPropsWithoutRef,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";

import { useWindowWidth } from "../react-hooks/useWindowWidth";

export interface PlockProps extends ComponentPropsWithoutRef<"div"> {
  gap?: string;
  debounce?: number;
  breakpoints?: Breakpoint[];
}

export interface Breakpoint {
  size: number;
  columns: number;
}

const first = (breakpoints: Breakpoint[]): Breakpoint => {
  return breakpoints[0];
};

const last = (breakpoints: Breakpoint[]): Breakpoint => {
  return breakpoints[breakpoints.length - 1];
};

const sorted = (breakpoints: Breakpoint[]): Breakpoint[] => {
  return breakpoints.sort((a, b) => a.size - b.size);
};

const contained = (breakpoints: Breakpoint[], width: number): Breakpoint[] => {
  return breakpoints.filter((el) => el.size <= width);
};

const calculateColumns = (breakpoints: Breakpoint[], width: number) => {
  const sortedBp = sorted(breakpoints);
  const containedBp = contained(sortedBp, width);
  const { columns } =
    containedBp.length < 1 ? first(sortedBp) : last(containedBp);

  return Array.from({ length: columns }, () => []) as unknown as [
    ReactElement[]
  ];
};

const DEFAULT_BREAKPOINTS = [{ size: 1280, columns: 3 }];

const Masonry = ({
  children,
  gap = "10px",
  debounce = 200,
  breakpoints = DEFAULT_BREAKPOINTS,
  ...props
}: PlockProps) => {
  const width = useWindowWidth({ debounceMs: debounce });
  const [columns, setColumns] = useState<[ReactElement[]?]>([]);

  useEffect(() => {
    const calculated = calculateColumns(breakpoints, width || 0);

    Children.forEach(children, (child, index) => {
      if (isValidElement(child)) {
        const cloned = cloneElement(child, {
          ...child.props,
          key: `plock-item-${child.key}`,
        });

        calculated[index % calculated.length].push(cloned);
      }
    });

    setColumns(calculated);
  }, [children, breakpoints, width]);

  return (
    <MasonryWrapper columns={columns.length} gap={gap} {...props}>
      {columns.map((column, index) => {
        return (
          <MasonryColumn gap={gap} key={index} data-testid="masonry-column">
            {column}
          </MasonryColumn>
        );
      })}
    </MasonryWrapper>
  );
};

export default Masonry;

interface MasonryProps extends ComponentPropsWithoutRef<"div"> {
  columns: number;
  gap: string;
  children: ReactNode;
}

const MasonryWrapper = ({ children, columns, gap, ...props }: MasonryProps) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(7rem, 1fr))`, // minmax(7rem, 1fr))
        columnGap: gap,
        alignItems: "start",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

interface MasonryColumnProps extends ComponentPropsWithoutRef<"div"> {
  gap: string;
  children: ReactNode;
}

const MasonryColumn = ({ children, gap, ...props }: MasonryColumnProps) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100%",
        rowGap: gap,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
