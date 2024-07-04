import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('local_devices_pkey', ['id'], { unique: true })
@Entity('local_devices', { schema: 'public' })
export class LocalDevices {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'optic_number', length: 50 })
    opticNumber: string;

    @Column('character varying', { name: 'serial_number', nullable: true })
    serialNumber: string | null;

    @Column('character varying', { name: 'docking_number', nullable: true })
    dockingNumber: string | null;

    @Column('boolean', { name: 'wb', nullable: true })
    wb: boolean | null;

    @Column('boolean', { name: 'cal', nullable: true })
    cal: boolean | null;

    @Column('timestamp without time zone', {
        name: 'refresh_date',
        nullable: true,
    })
    refreshDate: Date | null;

    @Column('character varying', {
        name: 'app_version',
        nullable: true,
        length: 100,
        default: () => "'VER_'",
    })
    appVersion: string | null;

    @Column('character varying', {
        name: 'app_update_date',
        nullable: true,
        length: 20,
    })
    appUpdateDate: string | null;

    @Column('character varying', { name: 'apk_url', nullable: true })
    apkUrl: string | null;

    @Column('integer', { name: 'application_id', nullable: true })
    applicationId: number | null;

    @Column('character varying', { name: 'division', nullable: true, length: 2 })
    division: string | null;

    @Column('date', { name: 'first_use_date', nullable: true })
    firstUseDate: string | null;

    @Column('character varying', { name: 'use_date', nullable: true, length: 20 })
    useDate: string | null;

    @Column('character varying', { name: 'use_time', nullable: true, length: 10 })
    useTime: string | null;

    @Column('character varying', {
        name: 'mac_address',
        nullable: true,
        length: 200,
    })
    macAddress: string | null;

    @Column('character varying', {
        name: 'app_use_yn',
        nullable: true,
        length: 1,
        default: () => "'N'",
    })
    appUseYn: string | null;

    @Column('character varying', {
        name: 'use_yn',
        nullable: true,
        length: 1,
        default: () => "'Y'",
    })
    useYn: string | null;

    @Column('integer', { name: 'license_period', nullable: true })
    licensePeriod: number | null;

    @Column('bigint', { name: 'enter_admin_user_id', nullable: true })
    enterAdminUserId: string | null;

    @Column('bigint', { name: 'release_admin_user_id', nullable: true })
    releaseAdminUserId: string | null;

    @Column('bigint', { name: 'sales_admin_user_id', nullable: true })
    salesAdminUserId: string | null;

    @Column('bigint', { name: 'agent_admin_user_id', nullable: true })
    agentAdminUserId: string | null;

    @Column('bigint', { name: 'license_id', nullable: true })
    licenseId: string | null;

    @Column('character varying', { name: 'license', nullable: true })
    license: string | null;

    @Column('date', { name: 'enter_at', nullable: true })
    enterAt: string | null;

    @Column('date', { name: 'release_at', nullable: true })
    releaseAt: string | null;

    @Column('timestamp without time zone', {
        name: 'regist_date',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP',
    })
    registDate: Date | null;

    @Column('character varying', { name: 'do_writer', nullable: true })
    doWriter: string | null;

    @Column('character varying', { name: 'do_number', nullable: true })
    doNumber: string | null;

    @Column('character varying', { name: 'customer_name', nullable: true })
    customerName: string | null;

    @Column('character varying', { name: 'brand_name', nullable: true })
    brandName: string | null;

    @Column('character varying', { name: 'country_code', nullable: true })
    countryCode: string | null;

    @Column('character varying', { name: 'customer_type', nullable: true })
    customerType: string | null;

    @Column('character varying', { name: 'sale_channel', nullable: true })
    saleChannel: string | null;

    @Column('character varying', { name: 'usage', nullable: true })
    usage: string | null;

    @Column('character varying', { name: 'ssid', nullable: true })
    ssid: string | null;

    @Column('character varying', { name: 'delivery_date', nullable: true })
    deliveryDate: string | null;

    @Column('character varying', { name: 'emb_docking_number', nullable: true })
    embDockingNumber: string | null;

    @Column('character varying', { name: 'remark', nullable: true })
    remark: string | null;

    @Column('timestamp without time zone', {
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @Column('timestamp without time zone', {
        name: 'updated_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @Column('integer', { name: 'consultant_company_id', nullable: true })
    consultantCompanyId: number | null;
}
