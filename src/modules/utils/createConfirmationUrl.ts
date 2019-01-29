import uuid from "uuid";
import { redis } from "../../redis";

export const createConfirmationUrl = async (userId: string) => {
  const confirmationId = uuid.v4();
  await redis.set(`confirmUser:${confirmationId}`, userId);
  return `http://localhost:3000/user/confirm/${confirmationId}`;
};
