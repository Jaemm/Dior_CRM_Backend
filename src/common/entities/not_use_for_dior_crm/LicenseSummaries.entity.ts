import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('license_summaries_pkey', ['id'], { unique: true })
@Entity('license_summaries', { schema: 'public' })
export class LicenseSummaries {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('timestamp without time zone', {
        name: 'extention_date',
        nullable: true,
    })
    extentionDate: Date | null;

    @Column('integer', { name: 'overall_count', nullable: true })
    overallCount: number | null;

    @Column('boolean', {
        name: 'payment_status',
        nullable: true,
        default: () => 'false',
    })
    paymentStatus: boolean | null;

    @Column('character varying', { name: 'agent_reference', nullable: true })
    agentReference: string | null;

    @Column('json', { name: 'data', nullable: true, default: '{}' })
    data: object | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @Column('character varying', { name: 'license_user_type', nullable: true })
    licenseUserType: string | null;

    @Column('character varying', { name: 'license_user_id', nullable: true })
    licenseUserId: string | null;
}
