import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('prescribed_products_pkey', ['id'], { unique: true })
@Entity('prescribed_products', { schema: 'public' })
export class PrescribedProducts {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('integer', { name: 'prescription_id', nullable: true })
    prescriptionId: number | null;

    @Column('integer', { name: 'product_id', nullable: true })
    productId: number | null;

    @Column('integer', { name: 'quantity', nullable: true })
    quantity: number | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
