import "reflect-metadata";
import "dotenv/config";
import * as express from "express";
import { ApolloServer } from "apollo-server-express";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as cors from "cors";
import * as Redis from "ioredis";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { customAuthChecker } from "./utils/authChecker";

const RedisStore = connectRedis(session as any);

const startServer = async () => {
  await createConnection();

  const app = express();

  const redis = new Redis();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [__dirname + "/modules/**/resolver.*"],
      authChecker: customAuthChecker
    }),
    context: ({ req }: any) => ({
      req,
      session: req.session,
      redis
    }),
    playground: {
      settings: {
        // put in entire setting object because of bug with Typscript and apollo-server (issue #1713)
        "general.betaUpdates": false,
        "editor.cursorShape": "line",
        "editor.fontSize": 14,
        "editor.fontFamily":
          "'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace",
        "editor.theme": "dark",
        "editor.reuseHeaders": true,
        "prettier.printWidth": 80,
        "request.credentials": "same-origin",
        "tracing.hideTracingResponse": true
      }
    }
  });

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:4000"
    })
  );

  app.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: "msh",
      secret: process.env.SESSION_SECRET as any,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 //One week
      }
    })
  );

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () => {
    console.log("server online");
  });
};

startServer();
