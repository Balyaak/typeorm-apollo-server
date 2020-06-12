import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import queryComplexity, {
  fieldConfigEstimator,
  simpleEstimator
} from "graphql-query-complexity";
import RateLimit from "express-rate-limit";
import RateLimitRedisStore from "rate-limit-redis";

import { redis } from "./redis";
import { createSchema } from "./utils/createSchema";

const startServer = async () => {
  await createConnection();
  const RedisStore = connectRedis(session as any)
  const app = express();

  const server = new ApolloServer({
    schema: await createSchema(),
    context: ({ req, res }: any) => ({
      req,
      session: req.session,
      redis,
      res
    }),
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
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    })
  );
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
