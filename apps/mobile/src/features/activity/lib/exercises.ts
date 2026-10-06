/** Exercises whose title contains every word of the search, ignoring case. */
export const filterExercises = <TExercise extends { title: string }>(
  exercises: TExercise[],
  search: string,
) => {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  return exercises.filter(({ title }) =>
    words.every((word) => title.toLowerCase().includes(word)),
  );
};

/** Sections for a SectionList, one per first letter, in alphabetical order. */
export const groupByFirstLetter = <TExercise extends { title: string }>(
  exercises: TExercise[],
) => {
  const sorted = [...exercises].sort((a, b) => a.title.localeCompare(b.title));
  // Hermes has no Map.groupBy.
  const groups = new Map<string, TExercise[]>();
  for (const exercise of sorted) {
    const letter = exercise.title.charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), exercise]);
  }

  return [...groups].map(([title, data]) => ({ title, data }));
};
