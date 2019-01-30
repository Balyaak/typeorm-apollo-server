import { Resolver, Ctx, Arg, Mutation, UseMiddleware } from "type-graphql";
import { Context } from "../types/Context";
import { isLoggedIn } from "../middleware/isLoggedIn";

@Resolver()
export class LogoutResolver {
  @UseMiddleware(isLoggedIn)
  @Mutation(() => Boolean)
  async logout(
    @Arg("logoutAll") logoutAll: boolean,
    @Ctx() { session, redis, res }: Context
  ): Promise<Boolean> {
    const sessionIds = await redis.lrange(`sess:${session.userId}`, 0, -1);
    if (logoutAll) {
      const promises: any[] = [];
      for (const sessionId of sessionIds) {
        promises.push(redis.del(`sess:${sessionId}`));
      }
      await Promise.all(promises);
    } else {
      await redis.lrem(`sess:${session.userId}`, 0, `sess:${session.id}`);
    }
    session.destroy(err => {
      if (err) {
        console.log(err);
      }
    });
    res.clearCookie("msh");
    return true;
  }
}
