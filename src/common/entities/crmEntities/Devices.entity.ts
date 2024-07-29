import {
    AfterLoad,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Products } from './Products.entity';
import { ConsultantCompanies } from './ConsultantCompanies.entity';

@Entity('devices', { schema: 'public' })
export class Devices {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column('character varying', {
        name: 'optic_number',
        unique: true,
        length: 50,
    })
    optic_number: string;

    @Column('character varying', { name: 'serial_number', nullable: true })
    serial_number: string | null;

    @Column('character varying', { name: 'docking_number', nullable: true })
    docking_number: string | null;

    @Column('boolean', { name: 'wb', nullable: true })
    wb: boolean | null;

    @Column('boolean', { name: 'cal', nullable: true })
    cal: boolean | null;

    @Column('timestamp without time zone', {
        name: 'refresh_date',
        nullable: true,
    })
    refresh_date: Date | null;

    @Column('character varying', {
        name: 'app_version',
        nullable: true,
        length: 100,
        default: () => "'VER_'",
    })
    app_version: string | null;

    @Column('character varying', {
        name: 'app_update_date',
        nullable: true,
        length: 20,
    })
    app_update_date: string | null;

    @Column('character varying', { name: 'division', nullable: true, length: 2 })
    division: string | null;

    @Column('character varying', {
        name: 'use_yn',
        nullable: true,
        length: 1,
        default: () => "'Y'",
    })
    use_yn: string | null;

    @Column('bigint', { name: 'enter_admin_user_id', nullable: true })
    enter_admin_user_id: string | null;

    @Column('bigint', { name: 'release_admin_user_id', nullable: true })
    release_admin_user_id: string | null;

    @Column('bigint', { name: 'sales_admin_user_id', nullable: true })
    sales_admin_user_id: string | null;

    @Column('bigint', { name: 'agent_admin_user_id', nullable: true })
    agent_admin_user_id: string | null;

    @Column('numeric', { name: 'lat', nullable: true, precision: 10, scale: 6 })
    lat: string | null;

    @Column('numeric', { name: 'lng', nullable: true, precision: 10, scale: 6 })
    lng: string | null;

    @Column('character varying', {
        name: 'pwd',
        nullable: true,
        default: () => "'CH7950'",
    })
    pwd: string | null;

    @Column('date', { name: 'enter_at', nullable: true })
    enter_at: string | null;

    @Column('date', { name: 'release_at', nullable: true })
    release_at: string | null;

    @Column('timestamp without time zone', {
        name: 'regist_date',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
    })
    regist_date: Date | null;

    @Column('character varying', { name: 'do_writer', nullable: true })
    do_writer: string | null;

    @Column('character varying', { name: 'do_number', nullable: true })
    do_number: string | null;

    @Column('character varying', { name: 'customer_name', nullable: true })
    customer_name: string | null;

    @Column('character varying', { name: 'brand_name', nullable: true })
    brand_name: string | null;

    @Column('character varying', { name: 'country_code', nullable: true })
    country_code: string | null;

    @Column('character varying', { name: 'customer_type', nullable: true })
    customer_type: string | null;

    @Column('character varying', { name: 'sale_channel', nullable: true })
    sale_channel: string | null;

    @Column('character varying', { name: 'usage', nullable: true })
    usage: string | null;

    @Column('character varying', { name: 'ssid', nullable: true })
    ssid: string | null;

    @Column('character varying', { name: 'delivery_date', nullable: true })
    delivery_date: string | null;

    @Column('character varying', { name: 'emb_docking_number', nullable: true })
    emb_docking_number: string | null;

    @Column('character varying', { name: 'remark', nullable: true })
    remark: string | null;

    @Column('integer', { name: 'consultant_company_id', nullable: true })
    consultant_company_id: number | null;

    @Column('character varying', { name: 'short_number', nullable: true })
    short_number: string | null;

    @Column('character varying', { name: 'pwd_digest', nullable: true })
    pwd_digest: string | null;

    @OneToMany(() => Products, (products) => products.device)
    products: Products[];

    @ManyToOne(() => ConsultantCompanies, (consultantCompanies) => consultantCompanies.devices)
    @JoinColumn([{ name: 'consultant_company_id', referencedColumnName: 'id' }])
    consultant_company: ConsultantCompanies;

    @AfterLoad()
    afterLoad() {
        this.id = Number(this.id);
    }

    get getBasicInfo() {
        return {
            id: this.id,
            optic_number: this.optic_number,
            serial_number: this.serial_number,
            docking_number: this.docking_number,
            wb: this.wb,
            cal: this.cal,
            refresh_date: this.refresh_date,
            app_version: this.app_version,
            app_update_date: this.app_update_date,
            division: this.division,
            use_yn: this.use_yn,
            lat: this.lat,
            lng: this.lng,
            consultant_company: this.consultant_company ? this.consultant_company.getBasicInfo : null,
        };
    }

    getLicensePeriod() {
        if (this.products && this.products.length > 0) {
            return this.products[0].license_period;
        }

        return null;
    }

    getConsultant() {
        if (this.products && this.products.length > 0) {
            return this.products[0].consultant;
        }

        return null;
    }
}
