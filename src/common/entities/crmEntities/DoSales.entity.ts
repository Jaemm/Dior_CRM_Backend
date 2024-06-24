import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("do_sales_pkey", ["id"], { unique: true })
@Entity("do_sales", { schema: "public" })
export class DoSales {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "sales_name", length: 100 })
  salesName: string;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;
}
