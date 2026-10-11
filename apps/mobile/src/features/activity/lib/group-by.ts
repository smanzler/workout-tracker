/** Groups items by key, keeping the order in which each key first appears. */
export const groupBy = <TItem>(
  items: TItem[],
  toKey: (item: TItem) => string,
) => {
  // Hermes has no Map.groupBy.
  const groups = new Map<string, TItem[]>();
  for (const item of items) {
    const key = toKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
};
