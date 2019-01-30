import { InputType, Field } from "type-graphql";
import { User } from "../../../entity/User";
import { MinLength, MaxLength, IsString, IsUUID } from "class-validator";

@InputType()
export class ChangePasswordInput implements Partial<User> {
  @Field()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @Field()
  @IsString()
  @IsUUID()
  changePasswordId: string;
}
