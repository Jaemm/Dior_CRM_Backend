import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('sales_conn_pkey', ['id'], { unique: true })
@Entity('sales_conn', { schema: 'public' })
export class SalesConn {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('integer', { name: 'batch_id' })
    batchId: number;

    @Column('integer', { name: 'consultant_id', nullable: true })
    consultantId: number | null;

    @Column('integer', { name: 'country_code', nullable: true })
    countryCode: number | null;

    @Column('character varying', { name: 'store_location', nullable: true })
    storeLocation: string | null;

    @Column('character varying', { name: 'sales' })
    sales: string;

    @Column('character varying', { name: 'comment', nullable: true })
    comment: string | null;

    @Column('integer', { name: 'brand_id', nullable: true })
    brandId: number | null;

    @Column('integer', { name: 'app_id', nullable: true })
    appId: number | null;

    @Column('timestamp without time zone', {
        name: 'created_at',
        nullable: true,
        default: () => 'now()',
    })
    createdAt: Date | null;
}
