import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index(
  "index_registered_app_devices_on_devicable_type_and_devicable_id",
  ["devicableId", "devicableType"],
  {}
)
@Index("registered_app_devices_pkey", ["id"], { unique: true })
@Entity("registered_app_devices", { schema: "public" })
export class RegisteredAppDevices {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "devicable_type" })
  devicableType: string;

  @Column("bigint", { name: "devicable_id" })
  devicableId: string;

  @Column("character varying", { name: "app_device", nullable: true })
  appDevice: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
