import { Resolver, Mutation, Ctx, Arg } from "type-graphql";
import * as argon2 from "argon2";
import { LoginInput } from "./inputs/LoginInput";

import { User } from "../../entity/User";
import { Context } from "../types/Context";

@Resolver()
export class LoginResolver {
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("input") { email, password }: LoginInput,
    @Ctx() { req, session, redis }: Context
  ): Promise<User | null | boolean> {
    if (req.session!.userId) {
      return null;
    }
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    if (!user.confirmed) {
      return user.confirmed;
    }

    const passwordValid = await argon2.verify(user.password, password);
    console.log(passwordValid);

    if (!passwordValid) {
      return null;
    }

    session.userId! = user.id;

    if (req.sessionID) {
      await redis.lpush(`sess:${user.id}`, req.sessionID);
    }
    return user;
  }
}
