import React, { useEffect } from "react";

import { useWindowWidth } from "../react-hooks/useWindowWidth";

export interface PlockProps extends React.ComponentPropsWithoutRef<"div"> {
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

  // ??? OMG THIS IS SO UGLY!
  return Array.from({ length: columns }, (e) => []) as unknown as [
    React.ReactElement[]
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
  const [columns, setColumns] = React.useState<[React.ReactElement[]?]>([]);

  useEffect(() => {
    const calculated = calculateColumns(breakpoints, width || 0);

    React.Children.forEach(children, (child, index) => {
      const key = uniqueId("plock-item-");

      if (React.isValidElement(child)) {
        const cloned = React.cloneElement(child, {
          ...child.props,
          key: key,
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

const idCounter: { [key: string]: number } = {};

function uniqueId(prefix = "$lodash$") {
  if (!idCounter[prefix]) {
    idCounter[prefix] = 0;
  }

  const id = ++idCounter[prefix];
  if (prefix === "$lodash$") {
    return `${id}`;
  }

  return `${prefix}${id}`;
}

interface MasonryProps extends React.ComponentPropsWithoutRef<"div"> {
  columns: number;
  gap: string;
  children: React.ReactNode;
}

const MasonryWrapper = ({ children, columns, gap, ...props }: MasonryProps) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        columnGap: gap,
        alignItems: "start",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

interface MasonryColumnProps extends React.ComponentPropsWithoutRef<"div"> {
  gap: string;
  children: React.ReactNode;
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
