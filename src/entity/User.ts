import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BaseEntity
} from "typeorm";

import * as argon2 from "argon2";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column("varchar", { length: 255 })
  email: string;

  @Column("text")
  password: string;

  @Column("bool", { default: false })
  confirmed: boolean;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await argon2.hash(this.password, { hashLength: 12 });
  }
}
