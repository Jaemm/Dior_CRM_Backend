import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("product_recommendation_selecteds_pkey", ["id"], { unique: true })
@Entity("product_recommendation_selecteds", { schema: "public" })
export class ProductRecommendationSelecteds {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "batch_id", nullable: true })
  batchId: number | null;

  @Column("integer", { name: "customer_id", nullable: true })
  customerId: number | null;

  @Column("integer", { name: "consultant_id", nullable: true })
  consultantId: number | null;

  @Column("integer", { name: "product_recommendation_id", nullable: true })
  productRecommendationId: number | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("integer", {
    name: "product_recommendation_group_id",
    nullable: true,
  })
  productRecommendationGroupId: number | null;
}
