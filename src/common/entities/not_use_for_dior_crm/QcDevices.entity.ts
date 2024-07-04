import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('index_qc_devices_on_device_id', ['deviceId'], {})
@Index('qc_devices_pkey', ['id'], { unique: true })
@Entity('qc_devices', { schema: 'public' })
export class QcDevices {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'device_id', nullable: true })
    deviceId: string | null;

    @Column('json', { name: 'value', nullable: true, default: '{}' })
    value: object | null;

    @Column('text', { name: 'comment', nullable: true })
    comment: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
