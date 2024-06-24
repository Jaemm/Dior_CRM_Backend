import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("product_attribute_translations_pkey", ["id"], { unique: true })
@Entity("product_attribute_translations", { schema: "public" })
export class ProductAttributeTranslations {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "product_attribute_id", nullable: true })
  productAttributeId: number | null;

  @Column("character varying", { name: "field_name", nullable: true })
  fieldName: string | null;

  @Column("character varying", { name: "language", nullable: true })
  language: string | null;

  @Column("character varying", { name: "value", nullable: true })
  value: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
