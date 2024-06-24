import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("faq_pkey", ["id"], { unique: true })
@Entity("faq", { schema: "public" })
export class Faq {
  @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
  id: string;

  @Column("character varying", { name: "company", nullable: true })
  company: string | null;

  @Column("character varying", { name: "name", nullable: true })
  name: string | null;

  @Column("character varying", { name: "surname", nullable: true })
  surname: string | null;

  @Column("character varying", { name: "phone", nullable: true })
  phone: string | null;

  @Column("character varying", { name: "email", nullable: true })
  email: string | null;

  @Column("character varying", { name: "inquiry", nullable: true })
  inquiry: string | null;

  @Column("character varying", { name: "details", nullable: true })
  details: string | null;

  @Column("character varying", { name: "country", nullable: true })
  country: string | null;

  @Column("character varying", { name: "usage", nullable: true })
  usage: string | null;

  @Column("character varying", { name: "info_source", nullable: true })
  infoSource: string | null;

  @Column("character varying", { name: "target_market", nullable: true })
  targetMarket: string | null;

  @Column("character varying", { name: "chowis_contact", nullable: true })
  chowisContact: string | null;

  @Column("character varying", { name: "experience", nullable: true })
  experience: string | null;

  @Column("character varying", { name: "used_devices", nullable: true })
  usedDevices: string | null;

  @Column("character varying", { name: "interest", nullable: true })
  interest: string | null;

  @Column("character varying", { name: "distribution", nullable: true })
  distribution: string | null;

  @Column("character varying", { name: "customization", nullable: true })
  customization: string | null;
}
