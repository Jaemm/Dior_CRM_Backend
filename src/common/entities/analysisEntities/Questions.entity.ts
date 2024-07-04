import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('questions_pkey', ['id'], { unique: true })
@Entity('questions', { schema: 'public' })
export class Questions {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('json', { name: 'body', nullable: true })
    body: object | null;

    @Column('json', { name: 'args', nullable: true })
    args: object | null;

    @Column('timestamp without time zone', {
        name: 'created_time',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdTime: Date | null;
}
