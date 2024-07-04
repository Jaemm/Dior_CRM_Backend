import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('index_states_on_country_id', ['countryId'], {})
@Index('states_pkey', ['id'], { unique: true })
@Entity('states', { schema: 'public' })
export class States {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'country_id', nullable: true })
    countryId: string | null;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('character varying', { name: 'state_code', nullable: true })
    stateCode: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
