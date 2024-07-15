import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Licenses } from './Licenses.entity';
import { Consultants } from './Consultants.entity';

@Index('index_consultant_licenses_on_consultant_id', ['consultantId'], {})
@Index('consultant_licenses_pkey', ['id'], { unique: true })
@Index('index_consultant_licenses_on_license_id', ['licenseId'], {})
@Entity('consultant_licenses', { schema: 'public' })
export class ConsultantLicenses {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column('bigint', { name: 'consultant_id', nullable: true })
    consultantId: number | null;

    @Column('bigint', { name: 'license_id', nullable: true })
    licenseId: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Licenses, (licenses) => licenses.consultantLicenses)
    @JoinColumn([{ name: 'license_id', referencedColumnName: 'id' }])
    licenses: Licenses;

    @ManyToOne(() => Consultants, (consultants) => consultants.consultant_licenses)
    @JoinColumn([{ name: 'consultant_id', referencedColumnName: 'id' }])
    consultants: Consultants;
}
