import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import schema from "./schema";
import { setGenerator } from "@nozbe/watermelondb/utils/common/randomId";
import * as Crypto from "expo-crypto";
import Exercise from "../models/Exercise";

const adapter = new SQLiteAdapter({
  schema,
  // migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.log(error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [Exercise],
});

setGenerator(() => Crypto.randomUUID());

export default database;

export const tasksCollection = database.get<Exercise>("exercises");
