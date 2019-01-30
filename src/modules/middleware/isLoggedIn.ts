import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";

export const isLoggedIn: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!context.req.session && !context.req.session!.userId) {
    throw new Error("You are not logged in");
  }
  return next();
};
