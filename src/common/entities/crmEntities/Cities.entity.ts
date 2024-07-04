import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('cities_pkey', ['id'], { unique: true })
@Index('index_cities_on_state_id', ['stateId'], {})
@Entity('cities', { schema: 'public' })
export class Cities {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'state_id', nullable: true })
    stateId: string | null;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
