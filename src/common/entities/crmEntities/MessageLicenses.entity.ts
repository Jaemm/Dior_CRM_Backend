import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('message_licenses_pkey', ['id'], { unique: true })
@Index('index_message_licenses_on_license_id', ['licenseId'], {})
@Index('index_message_licenses_on_message_id', ['messageId'], {})
@Entity('message_licenses', { schema: 'public' })
export class MessageLicenses {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'message_id', nullable: true })
    messageId: string | null;

    @Column('bigint', { name: 'license_id', nullable: true })
    licenseId: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
