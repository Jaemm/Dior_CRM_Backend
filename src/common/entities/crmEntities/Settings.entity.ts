import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("settings_pkey", ["id"], { unique: true })
@Index(
  "index_settings_on_thing_type_and_thing_id_and_var",
  ["thingId", "thingType", "var"],
  { unique: true }
)
@Entity("settings", { schema: "public" })
export class Settings {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "var" })
  var: string;

  @Column("text", { name: "value", nullable: true })
  value: string | null;

  @Column("integer", { name: "thing_id", nullable: true })
  thingId: number | null;

  @Column("character varying", {
    name: "thing_type",
    nullable: true,
    length: 30,
  })
  thingType: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
