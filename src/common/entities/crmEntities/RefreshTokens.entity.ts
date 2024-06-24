import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("refresh_tokens_pkey", ["id"], { unique: true })
@Entity("refresh_tokens", { schema: "public" })
export class RefreshTokens {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("bigint", { name: "tokenable_id", nullable: true })
  tokenableId: string | null;

  @Column("character varying", { name: "tokenable_type", nullable: true })
  tokenableType: string | null;

  @Column("character varying", { name: "refresh_token", nullable: true })
  refreshToken: string | null;

  @Column("timestamp without time zone", {
    name: "refresh_token_expired_at",
    nullable: true,
  })
  refreshTokenExpiredAt: Date | null;

  @Column("character varying", { name: "access_token", nullable: true })
  accessToken: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
