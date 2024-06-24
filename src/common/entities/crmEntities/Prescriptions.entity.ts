import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("prescriptions_pkey", ["id"], { unique: true })
@Entity("prescriptions", { schema: "public" })
export class Prescriptions {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "batch_id", nullable: true })
  batchId: number | null;

  @Column("integer", { name: "customer_id", nullable: true })
  customerId: number | null;

  @Column("character varying", { name: "date", nullable: true })
  date: string | null;

  @Column("integer", { name: "doctor_id", nullable: true })
  doctorId: number | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("integer", { name: "status", nullable: true })
  status: number | null;

  @Column("character varying", { name: "pharmacist_email", nullable: true })
  pharmacistEmail: string | null;

  @Column("character varying", { name: "logistic_email", nullable: true })
  logisticEmail: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("character varying", { name: "tracking_number", nullable: true })
  trackingNumber: string | null;

  @Column("character varying", { name: "courier", nullable: true })
  courier: string | null;
}
