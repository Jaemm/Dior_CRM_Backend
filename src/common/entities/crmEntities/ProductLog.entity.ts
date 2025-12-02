import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Products } from './Products.entity';
import { Consultants } from './Consultants.entity';

@Entity('product_logs')
export class ProductLogEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
    id: string;

    @Column({ name: 'product_id', type: 'bigint' })
    productId: string;

    @Column({ name: 'message', type: 'character varying' })
    message: string;

    @Column({ name: 'consultant_id', type: 'bigint', nullable: true })
    consultantId: string | null;

    @Column({ name: 'created_at', type: 'timestamp without time zone', nullable: true })
    createdAt: Date | null;

    @Column({ name: 'updated_at', type: 'timestamp without time zone', nullable: true })
    updatedAt: Date | null;

    @BeforeInsert()
    insertCreated() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @BeforeUpdate()
    insertUpdated() {
        this.updatedAt = new Date();
    }

    @ManyToOne(() => Products)
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    productEntity: Products;

    @ManyToOne(() => Consultants)
    @JoinColumn({ name: 'consultant_id', referencedColumnName: 'id' })
    consultantEntity: Consultants | null;
}
