import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("message_languages_pkey", ["id"], { unique: true })
@Index("index_message_languages_on_message_id", ["messageId"], {})
@Entity("message_languages", { schema: "public" })
export class MessageLanguages {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "title", nullable: true })
  title: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("character varying", { name: "language_name", nullable: true })
  languageName: string | null;

  @Column("character varying", { name: "language_code", nullable: true })
  languageCode: string | null;

  @Column("bigint", { name: "message_id", nullable: true })
  messageId: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
