import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Customers } from './Customers.entity';
import { Licenses } from './Licenses.entity';

@Index('index_customer_licenses_on_customer_id', ['customerId'], {})
@Index('customer_licenses_pkey', ['id'], { unique: true })
@Index('index_customer_licenses_on_license_id', ['licenseId'], {})
@Entity('customer_licenses', { schema: 'public' })
export class CustomerLicenses {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column('bigint', { name: 'customer_id', nullable: true })
    customerId: number | null;

    @Column('bigint', { name: 'license_id', nullable: true })
    licenseId: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Customers, (customers) => customers.customerLicenses)
    @JoinColumn([{ name: 'customer_id', referencedColumnName: 'id' }])
    customer: Customers;

    @ManyToOne(() => Licenses, (licenses) => licenses.customerLicenses)
    @JoinColumn([{ name: 'license_id', referencedColumnName: 'id' }])
    license: Licenses;
}
