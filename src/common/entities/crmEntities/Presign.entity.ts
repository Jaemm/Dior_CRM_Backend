import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('presign')
export class Presign {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column({ name: 'key', type: 'character varying' })
    key: string;

    @Column({ name: 'url', type: 'character varying' })
    url: string;

    @Column({ name: 'file_extension', type: 'character varying' })
    fileExtension: string;

    @Column({ name: 'prefix', type: 'character varying' })
    prefix: string;

    @Column({ name: 'file_name', type: 'character varying' })
    fileName: string;

    @Column({ name: 'mime_type', type: 'character varying' })
    mimeType: string;

    @Column({ name: 'consultant_id', type: 'bigint', nullable: true })
    consultantId: number;

    @Column({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;
}
