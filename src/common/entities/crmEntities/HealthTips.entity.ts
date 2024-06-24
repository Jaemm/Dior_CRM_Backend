import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("health_tips_pkey", ["id"], { unique: true })
@Entity("health_tips", { schema: "public" })
export class HealthTips {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "consultant_company_id", nullable: true })
  consultantCompanyId: number | null;

  @Column("integer", { name: "application_id", nullable: true })
  applicationId: number | null;

  @Column("character varying", { name: "tips_code", nullable: true })
  tipsCode: string | null;

  @Column("character varying", { name: "measurement", nullable: true })
  measurement: string | null;

  @Column("text", { name: "definition", nullable: true })
  definition: string | null;

  @Column("double precision", { name: "score", nullable: true, precision: 53 })
  score: number | null;

  @Column("text", { name: "reason", nullable: true })
  reason: string | null;

  @Column("text", { name: "solution", nullable: true })
  solution: string | null;

  @Column("character varying", { name: "reference", nullable: true })
  reference: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
