/** The index of each row, by id. */
export type Positions = Record<string, number>;

/** Moves the row at `from` to `to`, and shifts the rows between them. */
export const moveRow = (
  positions: Positions,
  id: string,
  from: number,
  to: number,
) => {
  "worklet";
  const next: Positions = {};
  for (const [key, position] of Object.entries(positions)) {
    const shift =
      from < to
        ? Number(position > from && position <= to) * -1
        : Number(position >= to && position < from);
    next[key] = position + shift;
  }
  next[id] = to;
  return next;
};
