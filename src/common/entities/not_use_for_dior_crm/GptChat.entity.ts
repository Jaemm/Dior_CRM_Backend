import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('gpt_chat_pkey', ['id'], { unique: true })
@Entity('gpt_chat', { schema: 'public' })
export class GptChat {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'app_id' })
    appId: string;

    @Column('text', { name: 'user_message', nullable: true })
    userMessage: string | null;

    @Column('text', { name: 'gpt_message', nullable: true })
    gptMessage: string | null;

    @Column('timestamp with time zone', {
        name: 'created_at',
        default: () => 'now()',
    })
    createdAt: Date;
}
