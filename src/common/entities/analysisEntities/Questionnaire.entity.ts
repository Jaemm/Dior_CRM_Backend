import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Analysis } from './Analysis.entity';

@Index('questionnaire_pkey', ['id'], { unique: true })
@Entity('questionnaire', { schema: 'public' })
export class Questionnaire {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'answers', nullable: true, length: 100 })
    answers: string | null;

    @Column('json', { name: 'args', nullable: true })
    args: object | null;

    @Column('timestamp without time zone', {
        name: 'created_time',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdTime: Date | null;

    @ManyToOne(() => Analysis, (analysis) => analysis.questionnaires)
    @JoinColumn([{ name: 'batch_id', referencedColumnName: 'batchId' }])
    batch: Analysis;
}
