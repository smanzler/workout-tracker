export const keysOf = <TKey extends string>(record: Record<TKey, unknown>) =>
  Object.keys(record).filter((key): key is TKey => key in record);
