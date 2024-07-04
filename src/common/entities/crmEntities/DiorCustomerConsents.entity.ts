import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('index_dior_customer_consents_on_consent_form_answers', ['consentFormAnswers'], {})
@Index('dior_customer_consents_pkey', ['id'], { unique: true })
@Entity('dior_customer_consents', { schema: 'public' })
export class DiorCustomerConsents {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('integer', { name: 'customer_id', nullable: true })
    customerId: number | null;

    @Column('character varying', { name: 'with_ipos_url', nullable: true })
    withIposUrl: string | null;

    @Column('character varying', { name: 'without_ipos_url', nullable: true })
    withoutIposUrl: string | null;

    @Column('character varying', { name: 'ipos_url', nullable: true })
    iposUrl: string | null;

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

    @Column('integer', { name: 'batch_id', nullable: true })
    batchId: number | null;
}
