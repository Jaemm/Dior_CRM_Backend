import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('pickup_case_pkey', ['id'], { unique: true })
@Entity('do_pickup_case', { schema: 'public' })
export class DoPickupCase {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;

    @Column('character varying', { name: 'name', nullable: true, length: 50 })
    name: string | null;
}
