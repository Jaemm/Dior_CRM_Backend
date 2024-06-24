import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("otp_tables_pkey", ["id"], { unique: true })
@Entity("otp_tables", { schema: "public" })
export class OtpTables {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "otp_token", nullable: true })
  otpToken: string | null;

  @Column("timestamp without time zone", {
    name: "otp_valid_til",
    nullable: true,
  })
  otpValidTil: Date | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("integer", { name: "target_id", nullable: true })
  targetId: number | null;

  @Column("character varying", { name: "target_type", nullable: true })
  targetType: string | null;

  @Column("character varying", { name: "phone_number", nullable: true })
  phoneNumber: string | null;
}
