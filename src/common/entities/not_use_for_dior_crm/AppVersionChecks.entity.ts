import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
// import { Applications } from './Applications.entity';

@Index('index_app_version_checks_on_app_id', ['appId'], {})
@Index('app_version_checks_pkey', ['id'], { unique: true })
@Entity('app_version_checks', { schema: 'public' })
export class AppVersionChecks {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'app_id', nullable: true })
    appId: string | null;

    @Column('character varying', { name: 'os', nullable: true })
    os: string | null;

    @Column('character varying', { name: 'app_version', nullable: true })
    appVersion: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    // @ManyToOne(
    //   () => Applications,
    //   (applications) => applications.appVersionChecks
    // )
    // @JoinColumn([{ name: "app_id", referencedColumnName: "id" }])
    // app: Applications;
}
