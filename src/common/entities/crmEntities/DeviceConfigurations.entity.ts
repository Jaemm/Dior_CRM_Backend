import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Devices } from "./Devices.entity";

@Index("device_configurations_pkey", ["id"], { unique: true })
@Index("optic_number_unique", ["optic_number"], { unique: true })
@Entity("device_configurations", { schema: "public" })
export class DeviceConfigurations {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", {
    name: "optic_number",
    unique: true,
    length: 50,
  })
  optic_number: string;

  @Column("jsonb", { name: "shading", nullable: true })
  shading: object | null;

  @Column("jsonb", { name: "hydration", nullable: true })
  hydration: object | null;

  @Column("jsonb", { name: "wb", nullable: true })
  wb: object | null;

  @Column("timestamp without time zone", {
    name: "created_time",
    default: () => "now()",
  })
  createdTime: Date;

  @Column("timestamp without time zone", {
    name: "updated_time",
    default: () => "now()",
  })
  updatedTime: Date;

  @OneToOne(() => Devices, (devices) => devices.deviceConfigurations, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "optic_number", referencedColumnName: "optic_number" }])
  opticNumber2: Devices;
}
