import { Column, Entity, Index } from "typeorm";

@Index("schema_migrations_pkey", ["version"], { unique: true })
@Entity("schema_migrations", { schema: "public" })
export class SchemaMigrations {
  @Column("character varying", { primary: true, name: "version" })
  version: string;
}
