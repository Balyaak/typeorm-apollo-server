import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";

import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { customAuthChecker } from "./utils/authChecker";
import queryComplexity, {
  fieldConfigEstimator,
  simpleEstimator
} from "graphql-query-complexity";
import { redis } from "./redis";

const startServer = async () => {
  await createConnection();
  const RedisStore = connectRedis(session);
  const app = express();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [__dirname + "/modules/user/*.*"],
      authChecker: customAuthChecker
    }),
    context: ({ req, res }: any) => ({
      req,
      session: req.session,
      redis,
      res
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
    },
    validationRules: [
      queryComplexity({
        maximumComplexity: 8,
        variables: {},
        onComplete: (complexity: number) => {
          console.log("Query Complexity:", complexity);
        },
        estimators: [
          fieldConfigEstimator(),
          simpleEstimator({
            defaultComplexity: 1
          })
        ]
      }) as any
    ]
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
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 //One week
      }
    })
  );

  server.applyMiddleware({ app });

  app.get("/", (_, res) => {
    res.redirect("/graphql");
  });

  app.listen({ port: 4000 }, () => {
    console.log("server online");
  });
};

startServer();
