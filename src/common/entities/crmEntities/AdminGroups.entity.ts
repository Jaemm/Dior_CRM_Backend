import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("admin_groups_pkey", ["id"], { unique: true })
@Entity("admin_groups", { schema: "public" })
export class AdminGroups {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "title", nullable: true })
  title: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("character varying", { name: "description", nullable: true })
  description: string | null;
}
