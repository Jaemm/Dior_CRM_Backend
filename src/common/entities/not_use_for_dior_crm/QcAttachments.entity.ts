import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('qc_attachments_pkey', ['id'], { unique: true })
@Index('index_qc_attachments_on_qc_device_id', ['qcDeviceId'], {})
@Entity('qc_attachments', { schema: 'public' })
export class QcAttachments {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'qc_device_id', nullable: true })
    qcDeviceId: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
