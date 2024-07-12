import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sales_connections', { schema: 'public' })
export class SalesConn {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('integer', { name: 'batch_id' })
    batchId: number;

    @Column('integer', { name: 'consultant_id', nullable: true })
    consultantId: number | null;

    @Column('integer', { name: 'answer1', nullable: true })
    answer1: string | null;
    @Column('integer', { name: 'answer2', nullable: true })
    answer2: string | null;

    @Column('integer', { name: 'country_name', nullable: true })
    countryName: string | null;

    @Column('timestamp without time zone', {
        name: 'created_at',
        nullable: true,
        default: () => 'now()',
    })
    createdAt: Date | null;

    @Column('timestamp without time zone', {
        name: 'updated_at',
        nullable: true,
        default: () => 'now()',
    })
    updatedAt: Date | null;
}
