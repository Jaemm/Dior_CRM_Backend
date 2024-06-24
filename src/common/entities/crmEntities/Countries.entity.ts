import { AfterLoad, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConsultantBranches } from './ConsultantBranches.entity';
import { ConsultantShops } from './ConsultantShops.entity';
import { Consultants } from './Consultants.entity';
import { Customers } from './Customers.entity';
import { DoWrite } from './DoWrite.entity';
import { UserInformation } from './UserInformation.entity';

@Index('countries_pkey', ['id'], { unique: true })
@Entity('countries', { schema: 'public' })
export class Countries {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column('int', { name: 'consultant_company_id', nullable: true })
    consultant_company_id: number | null;

    @Column('character varying', { name: 'name' })
    name: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @Column('character varying', { name: 'code', nullable: true })
    default_recommendation: string | null;

    @OneToMany(() => Customers, (customer: Customers) => customer.country)
    customers: Customers;

    @AfterLoad()
    afterLoad() {
        this.id = Number(this.id);
    }
}
