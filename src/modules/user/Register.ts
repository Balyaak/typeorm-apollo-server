import { Resolver, Mutation, Arg, Query, Ctx, Authorized } from "type-graphql";

import { User } from "../../entity/User";
import { RegisterInput } from "./inputs/RegisterInput";
import { Context } from "../types/Context";

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
    const user = await User.findOne({
      where: { email }
    });

    if (user) {
      return null;
    }

    await User.create({
      email,
      password
    }).save();
    return user;
  }
}
