import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Index('index_dior_customer_consents_on_consent_form_answers', ['consentFormAnswers'], {})
@Index('dior_customer_consents_pkey', ['id'], { unique: true })
@Entity('chowis_customer_consents', { schema: 'public' })
export class ChowisCustomerConsents {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'consent_type', nullable: true })
    consentType: string | null;

    @Column('varchar', {
        name: 'consent_form_answers',
        nullable: true,
        array: true,
    })
    consentFormAnswers: string[] | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @Column('integer', { name: 'customer_id', nullable: true })
    customer_id: number | null;

    @Column('boolean', { name: 'data_transfer', nullable: true })
    dataTransfer: boolean | null;

    @Column('boolean', { name: 'data_privacy', nullable: true })
    dataPrivacy: boolean | null;

    @Column('integer', { name: 'consultant_id', nullable: true })
    consultant_id: number | null;

    @Column('boolean', {
        name: 'receive_license_notification',
        nullable: true,
        default: () => 'false',
    })
    receiveLicenseNotification: boolean | null;

    @Column('boolean', {
        name: 'receive_newsletter',
        nullable: true,
        default: () => 'false',
    })
    receiveNewsletter: boolean | null;

    @Column('text', { name: 'additional_information', nullable: true })
    additionalInformation: string | null;

    // @ManyToOne(() => Customers, (customers) => customers.chowisCustomerConsents)
    // @JoinColumn([{ name: "customer_id", referencedColumnName: "id" }])
    // customer: Customers;
}
