import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("data_exchanges_pkey", ["id"], { unique: true })
@Entity("data_exchanges", { schema: "public" })
export class DataExchanges {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("json", { name: "json_data", nullable: true, default: "{}" })
  jsonData: object | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
