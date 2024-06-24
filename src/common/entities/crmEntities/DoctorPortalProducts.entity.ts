import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("doctor_portal_products_pkey", ["id"], { unique: true })
@Entity("doctor_portal_products", { schema: "public" })
export class DoctorPortalProducts {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "code", nullable: true })
  code: string | null;

  @Column("character varying", { name: "name", nullable: true })
  name: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("double precision", { name: "volume", nullable: true, precision: 53 })
  volume: number | null;

  @Column("double precision", { name: "price", nullable: true, precision: 53 })
  price: number | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
