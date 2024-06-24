import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Measurements } from "./Measurements.entity";

@Index("type_images_pkey", ["id"], { unique: true })
@Entity("type_images", { schema: "public" })
export class TypeImages {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name" })
  name: string;

  @OneToMany(() => Measurements, (measurements) => measurements.typeImage)
  measurements: Measurements[];
}
