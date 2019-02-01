import { createConnection } from "typeorm";

export const testConnection = async (drop: boolean = false) => {
  return await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "typegraphql-test",
    synchronize: drop,
    logging: false,
    dropSchema: drop,
    entities: [__dirname + "/../../entity/User.*"]
  });
};
