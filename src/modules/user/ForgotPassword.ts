import { Resolver, Mutation, Arg } from "type-graphql";
import { User } from "../../entity/User";
import uuid = require("uuid");
import { sendEmail } from "../utils/sendEmail";
import { redis } from "../../redis";

@Resolver()
export class ForgotPassword {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string): Promise<Boolean> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return true;
    }

    const changePasswordId = uuid.v4();

    await redis.set(
      "changePassword:" + changePasswordId,
      user.id,
      "ex",
      60 * 60 * 24
    );

    await sendEmail(
      email,
      `http://localhost:3000/user/password/${changePasswordId}`
    );

    return true;
  }
}
