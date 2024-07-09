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

    get fetchOptions() {
        const TWO_QUESTIONS = [
            'Collect and store my personal and sensitive data (e.g. skin pictures) in order to complete the skincare conultation.',
            'Store my sensitive personal data (e.g skin picture, beauty routine) for research purposes.',
        ];
        const FOUR_QUESTIONS = [
            'Collect and store my personal and sensitive data (e.g. skin pictures) in order to complete the skincare conultation.',
            'Collect and store my contact information to send me my skincare conultation',
            'Collect and store my skincare routine in my customer account, at the end of the consultation',
            'Store my sensitive personal data (e.g skin picture, beauty routine) for research purposes.',
        ];

        const answersCount = this.consentFormAnswers.length;

        const options: object[] = [];
        if (answersCount === 2) {
            this.consentFormAnswers.forEach((answer, i) => {
                options.push({
                    [TWO_QUESTIONS[i]]: answer,
                });
            });
        }

        if (answersCount === 4) {
            this.consentFormAnswers.forEach((answer, i) => {
                options.push({
                    [FOUR_QUESTIONS[i]]: answer,
                });
            });
        }

        return options;
    }
}
