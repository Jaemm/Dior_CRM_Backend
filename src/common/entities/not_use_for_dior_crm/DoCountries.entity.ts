import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('do_countries_pkey', ['id'], { unique: true })
@Entity('do_countries', { schema: 'public' })
export class DoCountries {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;

    @Column('character varying', { name: 'country_name' })
    countryName: string;

    @Column('character varying', { name: 'country_code' })
    countryCode: string;

    @Column('character varying', { name: 'national_plug' })
    nationalPlug: string;
}
