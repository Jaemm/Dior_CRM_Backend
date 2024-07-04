import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('otp_details_pkey', ['id'], { unique: true })
@Entity('otp_details', { schema: 'public' })
export class OtpDetails {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'phone', nullable: true })
    phone: string | null;

    @Column('character varying', { name: 'otp_type', nullable: true })
    otpType: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
