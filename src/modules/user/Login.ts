import { Resolver, Mutation, Ctx, Arg } from "type-graphql";
import * as argon2 from "argon2";
import { LoginInput } from "./inputs/LoginInput";
import { Context } from "apollo-server-core";
import { User } from "../../entity/User";

@Resolver()
export class LoginResolver {
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("input") { email, password }: LoginInput,
    @Ctx() { req, session, redis }: Context
  ): Promise<User | null> {
    if (req.session!.userId) {
      return null;
    }
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const passwordValid = argon2.verify(user.password, password);
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
