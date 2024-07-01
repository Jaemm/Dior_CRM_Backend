import { AfterLoad, Column, Entity, Index, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConsultantBranches } from './ConsultantBranches.entity';
import { ConsultantShops } from './ConsultantShops.entity';
import { DoWrite } from './DoWrite.entity';
import { UserInformation } from './UserInformation.entity';
import { Devices } from './Devices.entity';
import { Applications } from './Applications.entity';
import { Consultants } from './Consultants.entity';

@Index('consultant_companies_pkey', ['id'], { unique: true })
@Entity('consultant_companies', { schema: 'public' })
export class Brands {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    created_at: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updated_at: Date;

    @Column('character varying', { name: 'address', nullable: true })
    address: string | null;

    @Column('character varying', { name: 'email', nullable: true })
    email: string | null;

    @Column('character varying', { name: 'phone', nullable: true })
    phone: string | null;

    @Column('date', { name: 'registeration_date', nullable: true })
    registeration_date: string | null;

    @Column('character varying', { name: 'primary_color_code', nullable: true })
    primary_color_code: string | null;

    @Column('character varying', { name: 'secondary_color_code', nullable: true })
    secondary_color_code: string | null;

    @Column('character varying', { name: 'font', nullable: true })
    font: string | null;

    @Column('character varying', { name: 'program_color_code', nullable: true })
    program_color_code: string | null;

    @Column('character varying', { name: 'top_color_code', nullable: true })
    top_color_code: string | null;

    @Column('character varying', { name: 'text_icon_color_code', nullable: true })
    text_icon_color_code: string | null;

    @Column('character varying', { name: 'pie_chart_color_1', nullable: true })
    pie_chart_color_1: string | null;

    @Column('character varying', { name: 'pie_chart_color_2', nullable: true })
    pie_chart_color_2: string | null;

    @Column('character varying', { name: 'pie_chart_color_3', nullable: true })
    pie_chart_color_3: string | null;

    @Column('character varying', { name: 'pie_chart_color_4', nullable: true })
    pie_chart_color_4: string | null;

    @Column('character varying', { name: 'pie_chart_color_5', nullable: true })
    pie_chart_color_5: string | null;

    @Column('character varying', { name: 'pie_chart_points_color', nullable: true })
    pie_chart_points_color: string | null;

    @Column('boolean', { name: 'active', nullable: true, default: () => 'true' })
    active: boolean | null;

    @Column('character varying', { name: 'font_color_1', nullable: true })
    font_color_1: string | null;

    @Column('character varying', { name: 'font_color_2', nullable: true })
    font_color_2: string | null;

    @Column('character varying', { name: 'data_exchange_url', nullable: true })
    data_exchange_url: string | null;

    @Column('boolean', { name: 'pmx', nullable: true, default: () => 'false' })
    pmx: boolean | null;

    @OneToMany(() => ConsultantBranches, (consultantBranches) => consultantBranches.consultantCompany)
    consultantBranches: ConsultantBranches[];

    @OneToMany(() => DoWrite, (doWrite) => doWrite.customer)
    doWrites: DoWrite[];

    @OneToMany(() => UserInformation, (userInformation) => userInformation.company)
    userInformations: UserInformation[];

    @OneToMany(() => Devices, (devices) => devices.consultant_company)
    devices: Devices[];

    @OneToOne(() => Consultants, (consultants) => consultants.consultant_company)
    consultant: Consultants;

    @OneToMany(() => Applications, (applications) => applications.consultantCompany)
    applications: Applications[];

    @AfterLoad()
    afterLoad() {
        this.id = Number(this.id);
    }
}
