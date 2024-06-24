import { Column, Entity, Index } from "typeorm";

@Index("admin_users_token_pkey", ["id"], { unique: true })
@Entity("admin_users_token", { schema: "public" })
export class AdminUsersToken {
  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("character varying", {
    name: "token_id",
    nullable: true,
    length: 255,
  })
  tokenId: string | null;
}
