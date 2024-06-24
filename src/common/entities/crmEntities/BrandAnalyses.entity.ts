import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("index_brand_analyses_on_application_id", ["applicationId"], {})
@Index(
  "index_brand_analyses_on_consultant_company_id",
  ["consultantCompanyId"],
  {}
)
@Index("index_brand_analyses_on_custom_analysis_id", ["customAnalysisId"], {})
@Index("brand_analyses_pkey", ["id"], { unique: true })
@Entity("brand_analyses", { schema: "public" })
export class BrandAnalyses {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("bigint", { name: "application_id", nullable: true })
  applicationId: string | null;

  @Column("bigint", { name: "consultant_company_id", nullable: true })
  consultantCompanyId: string | null;

  @Column("bigint", { name: "custom_analysis_id", nullable: true })
  customAnalysisId: string | null;

  @Column("boolean", { name: "active", nullable: true, default: () => "true" })
  active: boolean | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
