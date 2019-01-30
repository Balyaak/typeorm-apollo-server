import { Resolver, Mutation, Arg } from "type-graphql";
import { redis } from "../../redis";
import { User } from "../../entity/User";
import { ChangePasswordInput } from "./inputs/ChangePasswordInput";
import * as argon2 from "argon2";

@Resolver()
export class ChangePasswordResolver {
  @Mutation(() => User, { nullable: true })
  async changePassword(@Arg("input")
  {
    changePasswordId,
    password
  }: ChangePasswordInput): Promise<User | null> {
    const userId = await redis.get("changePassword:" + changePasswordId);

    if (!userId) {
      return null;
    }

    const user = await User.findOne(userId);

    if (!user) {
      return null;
    }

    user.password = await argon2.hash(password, { hashLength: 12 });

    await user.save();

    return user;
  }
}
