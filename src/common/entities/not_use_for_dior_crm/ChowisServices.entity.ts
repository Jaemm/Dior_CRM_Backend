import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('chowis_services_pkey', ['id'], { unique: true })
@Entity('chowis_customer_consents', { schema: 'public' })
export class ChowisServices {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('character varying', { name: 'service_type', nullable: true })
    service_type: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    created_at: string | null;
}
