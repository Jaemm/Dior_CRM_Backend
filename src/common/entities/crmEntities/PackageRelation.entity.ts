import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DoPackages } from "./DoPackages.entity";
import { DoProductPortfolio } from "./DoProductPortfolio.entity";

@Index("package_relation_pkey", ["id"], { unique: true })
@Entity("package_relation", { schema: "public" })
export class PackageRelation {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "product_quantity" })
  productQuantity: number;

  @ManyToOne(() => DoPackages, (doPackages) => doPackages.packageRelations)
  @JoinColumn([{ name: "package_id", referencedColumnName: "id" }])
  package: DoPackages;

  @ManyToOne(
    () => DoProductPortfolio,
    (doProductPortfolio) => doProductPortfolio.packageRelations
  )
  @JoinColumn([{ name: "product_id", referencedColumnName: "id" }])
  product: DoProductPortfolio;
}
