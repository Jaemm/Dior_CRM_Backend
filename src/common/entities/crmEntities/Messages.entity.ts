import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("messages_pkey", ["id"], { unique: true })
@Entity("messages", { schema: "public" })
export class Messages {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "kind", nullable: true })
  kind: string | null;

  @Column("character varying", { name: "send_kind", nullable: true })
  sendKind: string | null;

  @Column("character varying", { name: "os", nullable: true })
  os: string | null;

  @Column("character varying", { name: "language", nullable: true })
  language: string | null;

  @Column("character varying", { name: "title", nullable: true })
  title: string | null;

  @Column("text", { name: "message", nullable: true })
  message: string | null;

  @Column("text", { name: "ios_link", nullable: true })
  iosLink: string | null;

  @Column("text", { name: "android_link", nullable: true })
  androidLink: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
