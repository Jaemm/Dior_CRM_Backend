import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConsultantStores } from './ConsultantStores.entity';
import { Consultants } from './Consultants.entity';

@Index('index_consultant_countries_on_consultant_branch_id', ['consultantBranchId'], {})
@Index('consultant_countries_pkey', ['id'], { unique: true })
@Entity('consultant_countries', { schema: 'public' })
export class ConsultantCountries {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'consultant_branch_id', nullable: true })
    consultantBranchId: string | null;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @Column('integer', { name: 'consultant_company_id', nullable: true })
    consultantCompanyId: number | null;

    @Column('character varying', { name: 'code', nullable: true })
    code: string | null;

    @Column('character varying', { name: 'url_and_port', nullable: true })
    urlAndPort: string | null;

    @Column('character varying', {
        name: 'default_recommendation',
        nullable: true,
    })
    defaultRecommendation: string | null;

    @OneToMany(() => Consultants, (consultants) => consultants.country_details)
    consultants: Consultants;
}
