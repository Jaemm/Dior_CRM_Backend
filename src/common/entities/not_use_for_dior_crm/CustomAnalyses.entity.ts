import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("index_custom_analyses_on_application_id", ["applicationId"], {})
@Index("custom_analyses_pkey", ["id"], { unique: true })
@Entity("custom_analyses", { schema: "public" })
export class CustomAnalyses {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "analysis_name", nullable: true })
  analysisName: string | null;

  @Column("character varying", { name: "analysis_type", nullable: true })
  analysisType: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("bigint", { name: "application_id", nullable: true })
  applicationId: string | null;

  @Column("character varying", { name: "algorithm_id", nullable: true })
  algorithmId: string | null;
}
