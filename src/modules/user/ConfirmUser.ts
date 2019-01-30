import { Resolver, Mutation, Arg } from "type-graphql";
import { redis } from "../../redis";
import { User } from "../../entity/User";

@Resolver()
export class ConfirmUserResolver {
  @Mutation(() => User, { nullable: true })
  async confirmUser(
    @Arg("confirmationId") confrimationId: string
  ): Promise<User | null> {
    const userId = await redis.get("confirmUser:" + confrimationId);
    if (!userId) {
      return null;
    }
    const user = await User.findOne(userId);
    if (!user) {
      return null;
    }
    await User.update({ id: userId }, { confirmed: true });
    await redis.del("confirmUser:" + confrimationId);
    return user!;
  }
}
