import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('push_notification_pkey', ['id'], { unique: true })
@Entity('push_notification', { schema: 'public' })
export class PushNotification {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'url', nullable: true, length: 250 })
    url: string | null;

    @Column('character varying', {
        name: 'token_url',
        nullable: true,
        length: 250,
    })
    tokenUrl: string | null;

    @Column('character varying', {
        name: 'response',
        nullable: true,
        length: 250,
    })
    response: string | null;

    @Column('timestamp without time zone', {
        name: 'created_time',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdTime: Date | null;
}
