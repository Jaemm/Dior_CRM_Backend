import { AfterLoad, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConsultantBranches } from './ConsultantBranches.entity';
import { ConsultantCompanies } from './ConsultantCompanies.entity';
import { Countries } from './Countries.entity';
import { Consultants } from './Consultants.entity';

class StringToNumberTransformer {
    to(value: string): number {
        return parseInt(value, 10);
    }

    from(value: string): number {
        return parseInt(value, 10);
    }
}

@Index('index_consultant_shops_on_consultant_branch_id', ['consultantBranchId'], {})
@Index('consultant_shops_pkey', ['id'], { unique: true })
@Entity('consultant_shops', { schema: 'public' })
export class ConsultantShops {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column('bigint', { name: 'consultant_branch_id', nullable: true })
    consultantBranchId: string | null;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => ConsultantBranches, (consultantBranches) => consultantBranches.consultantShops, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'consultant_branch_id', referencedColumnName: 'id' }])
    consultantBranch: ConsultantBranches;

    @OneToMany(() => Consultants, (consultants) => consultants.consultant_shop)
    consultants: Consultants[];

    @AfterLoad()
    afterLoad() {
        this.id = Number(this.id);
    }
}
