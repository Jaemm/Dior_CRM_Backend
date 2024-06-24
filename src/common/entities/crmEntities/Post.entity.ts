import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("post", { schema: "public" })
export class Post {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "title" })
  title: string;

  @Column("character varying", { name: "content" })
  content: string;
}
