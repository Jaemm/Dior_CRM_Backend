import { Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Consultants } from './Consultants.entity';

@Index('identities_pkey', ['id'], { unique: true })
@Entity('identities', { schema: 'public' })
export class Identities {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'meta_type', nullable: true })
    metaType: string | null;

    @Column('integer', { name: 'meta_id', nullable: true })
    metaId: number | null;

    @Column('text', { name: 'social_id', nullable: true })
    socialId: string | null;

    @Column('character varying', { name: 'social_provider', nullable: true })
    socialProvider: string | null;

    @Column('text', { name: 'social_token', nullable: true })
    socialToken: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Consultants, (consultant) => consultant.identities)
    @JoinColumn([{ name: 'meta_id', referencedColumnName: 'id' }])
    consultants: Consultants;
}
