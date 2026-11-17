/**
 * A line of items split by "·". Each dot sits inside the no-wrap span of the
 * item that follows it, so a line can end on an item but never start on a dot.
 */
export function DotList({ items }: { items: React.ReactNode[] }) {
  return (
    <>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span className="whitespace-nowrap">
            {i > 0 && "· "}
            {item}
          </span>
        </span>
      ))}
    </>
  );
}
