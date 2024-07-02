import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("do_business_team_pkey", ["id"], { unique: true })
@Entity("do_business_team", { schema: "public" })
export class DoBusinessTeam {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "bt_name", length: 100 })
  btName: string;

  @Column("timestamp without time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;
}
