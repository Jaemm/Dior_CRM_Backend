import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index(
  "index_loreal_crm_details_on_crmable_type_and_crmable_id",
  ["crmableId", "crmableType"],
  {}
)
@Index("loreal_crm_details_pkey", ["id"], { unique: true })
@Entity("loreal_crm_details", { schema: "public" })
export class LorealCrmDetails {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "crmable_type" })
  crmableType: string;

  @Column("bigint", { name: "crmable_id" })
  crmableId: string;

  @Column("boolean", {
    name: "crm_status_consumer",
    nullable: true,
    default: () => "false",
  })
  crmStatusConsumer: boolean | null;

  @Column("boolean", {
    name: "crm_status_transaction",
    nullable: true,
    default: () => "false",
  })
  crmStatusTransaction: boolean | null;

  @Column("character varying", { name: "crm_error_message", nullable: true })
  crmErrorMessage: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;
}
