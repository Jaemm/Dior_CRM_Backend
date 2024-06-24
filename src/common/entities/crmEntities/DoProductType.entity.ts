import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("do_product_type_pkey", ["id"], { unique: true })
@Entity("do_product_type", { schema: "public" })
export class DoProductType {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "p_type", nullable: true, length: 100 })
  pType: string | null;
}
