import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('index_message_applications_on_application_id', ['applicationId'], {})
@Index('message_applications_pkey', ['id'], { unique: true })
@Index('index_message_applications_on_message_id', ['messageId'], {})
@Entity('message_applications', { schema: 'public' })
export class MessageApplications {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'message_id', nullable: true })
    messageId: string | null;

    @Column('bigint', { name: 'application_id', nullable: true })
    applicationId: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
