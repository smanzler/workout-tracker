import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "exercises",
      columns: [
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "category", type: "string" },
        { name: "image", type: "string", isOptional: true },
        { name: "user_id", type: "string", isOptional: true },
        { name: "muscle_group", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "workouts",
      columns: [
        { name: "name", type: "string" },
        { name: "date", type: "number" },
        { name: "user_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "supersets",
      columns: [
        { name: "workout_id", type: "string", isIndexed: true },
        { name: "order", type: "number" },
        { name: "user_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "workout_exercises",
      columns: [
        { name: "workout_id", type: "string", isIndexed: true },
        { name: "exercise_id", type: "string", isIndexed: true },
        {
          name: "superset_id",
          type: "string",
          isIndexed: true,
          isOptional: true,
        },
        { name: "order", type: "number" },
        { name: "user_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "sets",
      columns: [
        { name: "workout_exercise_id", type: "string", isIndexed: true },
        { name: "reps", type: "number" },
        { name: "weight", type: "number" },
        { name: "user_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "templates",
      columns: [
        { name: "name", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "user_id", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "template_exercises",
      columns: [
        { name: "template_id", type: "string", isIndexed: true },
        { name: "exercise_id", type: "string", isIndexed: true },
        {
          name: "superset_id",
          type: "string",
          isIndexed: true,
          isOptional: true,
        },
        { name: "order", type: "number" },
        { name: "user_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});
