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
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});
