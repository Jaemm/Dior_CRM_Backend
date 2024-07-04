import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('index_consultant_countrys_on_consultant_branch_id', ['consultantBranchId'], {})
@Index('consultant_countrys_pkey', ['id'], { unique: true })
@Entity('consultant_countrys', { schema: 'public' })
export class ConsultantCountrys {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'consultant_branch_id', nullable: true })
    consultantBranchId: string | null;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
