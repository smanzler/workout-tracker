import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: "exercises",
      columns: [
        { name: "title", type: "string" },
        { name: "description", type: "string" },
        { name: "category", type: "string", isOptional: true },
        { name: "image", type: "string", isOptional: true },
        { name: "muscle_group", type: "string", isOptional: true },
        { name: "is_default", type: "boolean" },
        { name: "user_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "workouts",
      columns: [
        { name: "name", type: "string" },
        { name: "start_time", type: "number" },
        { name: "end_time", type: "number", isOptional: true },
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
        { name: "workout_start_time", type: "number" },
        { name: "reps", type: "number", isOptional: true },
        { name: "weight", type: "number", isOptional: true },
        { name: "order", type: "number" },
        { name: "completed", type: "boolean" },
        { name: "is_weight_pr", type: "boolean" },
        { name: "is_volume_pr", type: "boolean" },
        { name: "is_1rm_pr", type: "boolean" },
        { name: "user_id", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "routines",
      columns: [
        { name: "name", type: "string" },
        { name: "description", type: "string", isOptional: true },
        { name: "user_id", type: "string", isIndexed: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "routine_exercises",
      columns: [
        { name: "routines_id", type: "string", isIndexed: true },
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
