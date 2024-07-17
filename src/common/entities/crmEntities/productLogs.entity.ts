import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductLogs {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column({ name: 'product_id', type: 'bigint' })
    productId: string;

    @Column({ name: 'consultant_id', type: 'bigint' })
    consultantId: string;

    @Column({ name: 'message', type: 'character varying' })
    message: string;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
