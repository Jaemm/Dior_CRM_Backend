import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConsultantCountries } from './ConsultantCountries.entity';

@Index('index_consultant_stores_on_consultant_country_id', ['consultantCountryId'], {})
@Index('consultant_stores_pkey', ['id'], { unique: true })
@Entity('consultant_stores', { schema: 'public' })
export class ConsultantStores {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'consultant_country_id', nullable: true })
    consultantCountryId: string | null;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
