import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("do_as_pkey", ["id"], { unique: true })
@Entity("do_as", { schema: "public" })
export class DoAs {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "as_name", length: 100 })
  asName: string;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;
}
