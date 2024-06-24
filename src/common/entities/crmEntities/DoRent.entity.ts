import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("do_rent_pkey", ["id"], { unique: true })
@Entity("do_rent", { schema: "public" })
export class DoRent {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "rent_name", length: 100 })
  rentName: string;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;
}
