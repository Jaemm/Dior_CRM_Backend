import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Index('package_relation_pkey', ['id'], { unique: true })
@Entity('package_relation', { schema: 'public' })
export class PackageRelation {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;

    @Column('integer', { name: 'product_quantity' })
    productQuantity: number;

}
