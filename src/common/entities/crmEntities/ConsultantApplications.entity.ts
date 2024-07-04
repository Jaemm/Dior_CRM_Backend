import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Applications } from './Applications.entity';

@Index('index_consultant_applications_on_application_id', ['applicationId'], {})
@Index('index_consultant_applications_on_consultant_id', ['consultantId'], {})
@Index('consultant_applications_pkey', ['id'], { unique: true })
@Entity('consultant_applications', { schema: 'public' })
export class ConsultantApplications {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column('bigint', { name: 'consultant_id', nullable: true })
    consultantId: number | null;

    @Column('bigint', { name: 'application_id', nullable: true })
    applicationId: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Applications, (applications) => applications.consultantApplications)
    @JoinColumn([
        { name: 'application_id', referencedColumnName: 'id' },
        { name: 'application_id', referencedColumnName: 'id' },
    ])
    applications: Applications;
}
