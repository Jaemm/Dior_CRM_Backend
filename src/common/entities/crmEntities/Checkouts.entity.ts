import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("checkouts_pkey", ["id"], { unique: true })
@Entity("checkouts", { schema: "public" })
export class Checkouts {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("integer", { name: "customer_id", nullable: true })
  customerId: number | null;

  @Column("integer", { name: "duration", nullable: true })
  duration: number | null;

  @Column("character varying", { name: "first_name", nullable: true })
  firstName: string | null;

  @Column("character varying", { name: "last_name", nullable: true })
  lastName: string | null;

  @Column("character varying", { name: "gender", nullable: true })
  gender: string | null;

  @Column("character varying", { name: "birth", nullable: true })
  birth: string | null;

  @Column("character varying", { name: "email", nullable: true })
  email: string | null;

  @Column("character varying", { name: "phone", nullable: true })
  phone: string | null;

  @Column("character varying", { name: "tracking_number", nullable: true })
  trackingNumber: string | null;

  @Column("character varying", { name: "courier", nullable: true })
  courier: string | null;

  @Column("character varying", { name: "other_details", nullable: true })
  otherDetails: string | null;

  @Column("character varying", { name: "street", nullable: true })
  street: string | null;

  @Column("character varying", { name: "city", nullable: true })
  city: string | null;

  @Column("character varying", { name: "country", nullable: true })
  country: string | null;

  @Column("character varying", { name: "zip_code", nullable: true })
  zipCode: string | null;

  @Column("character varying", { name: "shipping_first_name", nullable: true })
  shippingFirstName: string | null;

  @Column("character varying", { name: "shipping_last_name", nullable: true })
  shippingLastName: string | null;

  @Column("character varying", { name: "shipping_street", nullable: true })
  shippingStreet: string | null;

  @Column("character varying", { name: "shipping_city", nullable: true })
  shippingCity: string | null;

  @Column("character varying", { name: "shipping_country", nullable: true })
  shippingCountry: string | null;

  @Column("character varying", { name: "shipping_zip_code", nullable: true })
  shippingZipCode: string | null;

  @Column("character varying", {
    name: "shipping_other_details",
    nullable: true,
  })
  shippingOtherDetails: string | null;

  @Column("character varying", { name: "device_sent", nullable: true })
  deviceSent: string | null;

  @Column("timestamp without time zone", { name: "created_at" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updated_at" })
  updatedAt: Date;

  @Column("character varying", { name: "external_id", nullable: true })
  externalId: string | null;

  @Column("json", { name: "external_data", nullable: true })
  externalData: object | null;

  @Column("integer", { name: "status", nullable: true, default: () => "0" })
  status: number | null;
}
