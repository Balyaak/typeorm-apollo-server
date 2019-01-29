import { Resolver, Mutation, Arg, Query, Ctx, Authorized } from "type-graphql";

import { User } from "../../entity/User";
import { RegisterInput } from "./inputs/RegisterInput";
import { Context } from "../types/Context";
import { sendEmail } from "../utils/sendEmail";
import { createConfirmationUrl } from "../utils/createConfirmationUrl";

@Resolver()
export class RegisterResolver {
  constructor() {}

  @Query(() => User, { nullable: true })
  @Authorized()
  async me(@Ctx() { session }: Context) {
    return User.findOne({ where: { id: session.userId } });
  }

  @Mutation(() => User, { nullable: true })
  async register(@Arg("input")
  {
    email,
    password
  }: RegisterInput): Promise<User | null> {
    const possibleUser = await User.findOne({
      where: { email }
    });

    if (possibleUser) {
      return null;
    }

    const user = await User.create({
      email,
      password
    }).save();

    await sendEmail(email, await createConfirmationUrl(user.id));

    return user;
  }
}
