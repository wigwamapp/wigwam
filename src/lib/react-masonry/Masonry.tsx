import { HTMLAttributes, memo, ReactNode, useMemo } from "react";

type MasonryProps = HTMLAttributes<HTMLDivElement> & {
  items: any[];
  renderItem: (item: any, i: number) => ReactNode;
  gap: string;
};

const Masonry = memo<MasonryProps>(({ items, renderItem, gap, ...rest }) => {
  const columns = useMemo(() => {
    const col: any[][] = [[], [], []];

    if (items.length === 0) return col;

    for (let i = 0; i < items.length; i++) {
      col[i % 3].push({ item: items[i], i });
    }

    return col;
  }, [items]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns.length}, minmax(0.5rem, 1fr))`,
        columnGap: gap,
        alignItems: "start",
        width: "100%",
      }}
      {...rest}
    >
      {columns.map((columnItems, columnIndex) => (
        <div
          key={columnIndex}
          style={{
            display: "grid",
            gridTemplateColumns: "100%",
            rowGap: gap,
          }}
        >
          {columnItems.map(({ item, i }) => renderItem(item, i))}
        </div>
      ))}
    </div>
  );
});

export default Masonry;
