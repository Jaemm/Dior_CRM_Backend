import { Column, Entity, Index } from "typeorm";

@Index("social_networks_pkey", ["id"], { unique: true })
@Entity("social_networks", { schema: "public" })
export class SocialNetworks {
  @Column("integer", { primary: true, name: "id" })
  id: number;

  @Column("character varying", { name: "name" })
  name: string;

  @Column("timestamp without time zone", {
    name: "created_at",
    default: () => "now()",
  })
  createdAt: Date;

  @Column("timestamp without time zone", {
    name: "updated_at",
    default: () => "now()",
  })
  updatedAt: Date;
}
