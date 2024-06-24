import { Column, Entity, Index } from "typeorm";

@Index("ar_internal_metadata_pkey", ["key"], { unique: true })
@Entity("ar_internal_metadata", { schema: "public" })
export class ArInternalMetadata {
  @Column("character varying", { primary: true, name: "key" })
  key: string;

  @Column("character varying", { name: "value", nullable: true })
  value: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
