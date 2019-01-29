import { Resolver, Mutation, Arg } from "type-graphql";
import { redis } from "../../redis";
import { User } from "../../entity/User";

@Resolver()
export class ConfirmUserResolver {
  @Mutation(() => Boolean)
  async confirmUser(@Arg("confirmationId") confrimationId: string) {
    const userId = await redis.get("confirmUser:" + confrimationId);
    if (!userId) {
      return false;
    }
    await User.update({ id: userId }, { confirmed: true });
    await redis.del("confirmUser:" + confrimationId);
    return true;
  }
}
