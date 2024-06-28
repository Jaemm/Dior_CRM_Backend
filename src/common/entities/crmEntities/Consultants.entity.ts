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
import { ConsultantShops } from './ConsultantShops.entity';
import { Countries } from './Countries.entity';
import { Genders } from './Genders.entity';
import { Customers } from './Customers.entity';
import { ConsultantCompanies } from './ConsultantCompanies.entity';
import { Position } from 'aws-sdk/clients/codecommit';
import { ConsultantPositions } from './ConsultantPositions.entity';
import { Products } from './Products.entity';
import { ConsultantCountries } from './ConsultantCountries.entity';
import { ConsultantBranches } from './ConsultantBranches.entity';

@Index('index_consultants_on_email_and_app_id', ['app_id', 'email'], {
    unique: true,
})
@Index('index_consultants_on_consultant_branch_id', ['consultant_branch_id'], {})
@Index('index_consultants_on_consultant_company_id', ['consultant_company_id'], {})
@Index('index_consultants_on_consultant_position_id', ['consultant_position_id'], {})
@Index('index_consultants_on_consultant_shop_id', ['consultant_shop_id'], {})
@Index('index_consultants_on_email', ['email'], {})
@Index('consultants_id_seq', ['id'], { unique: true })
@Index('index_consultants_on_token', ['token'], {})
@Entity('consultants', { schema: 'public' })
export class Consultants {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    'id': number;

    @Column('bigint', {
        name: 'consultant_company_id',
        nullable: true,
        default: () => '1',
    })
    'consultant_company_id': number | null;

    @Column('bigint', { name: 'consultant_branch_id', nullable: true })
    'consultant_branch_id': number | null;

    @Column('bigint', { name: 'consultant_shop_id', nullable: true })
    'consultant_shop_id': number | null;

    @Column('bigint', {
        name: 'consultant_position_id',
        nullable: true,
        default: () => '4',
    })
    'consultant_position_id': number | null;

    @Column('character varying', { name: 'token', nullable: true })
    'token': string | null;

    @Column('character varying', { name: 'email', nullable: true })
    'email': string | null;

    @Column('character varying', { name: 'password_digest', nullable: true })
    'password_digest': string | null;

    @Column('character varying', {
        name: 'recovery_password_digest',
        nullable: true,
    })
    'recovery_password_digest': string | null;

    @Column('character varying', { name: 'social', nullable: true })
    'social': string | null;

    @Column('character varying', { name: 'social_id', nullable: true })
    'social_id': string | null;

    @Column('character varying', { name: 'name', nullable: true })
    'name': string | null;

    @Column('character varying', { name: 'phone', nullable: true })
    'phone': string | null;

    @Column('text', { name: 'address', nullable: true })
    'address': string | null;

    @Column('text', { name: 'note', nullable: true })
    'note': string | null;

    @Column('text', { name: 'push_token', nullable: true })
    'push_token': string | null;

    @Column('boolean', {
        name: 'approved',
        nullable: true,
        default: () => 'false',
    })
    'approved': boolean | null;

    @Column('character varying', { name: 'surname', nullable: true })
    'surname': string | null;

    @Column('character varying', { name: 'gender', nullable: true })
    'gender': string | null;

    @Column('character varying', { name: 'birthdate', nullable: true })
    'birthdate': string | null;

    @Column('character varying', { name: 'city', nullable: true })
    'city': string | null;

    @Column('text', {
        name: 'country',
        nullable: true,
        array: true,
        default: () => "'{}'[]",
    })
    'country': string[] | null;

    @Column('integer', { name: 'app_id', nullable: true })
    'app_id': number | null;

    @Column('bigint', { name: 'consultant_country_id', nullable: true })
    'consultant_country_id': number | null;

    @Column('bigint', { name: 'consultant_store_id', nullable: true })
    'consultant_store_id': number | null;

    @Column('boolean', { name: 'email_confirmed', nullable: true })
    'email_confirmed': boolean | null;

    @Column('character varying', { name: 'confirm_token', nullable: true })
    'confirm_token': string | null;

    @Column('character varying', { name: 'os', nullable: true })
    'os': string | null;

    @Column('character varying', { name: 'language', nullable: true })
    'language': string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    'created_at': Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    'updated_at': Date;

    @Column('character varying', { name: 'memo', nullable: true })
    'memo': string | null;

    @Column('character varying', { name: 'company_name', nullable: true })
    'company_name': string | null;

    @Column('character varying', { name: 'company_address', nullable: true })
    'company_address': string | null;

    @Column('character varying', { name: 'position', nullable: true })
    'position': string | null;

    @Column('character varying', { name: 'branch', nullable: true })
    'branch': string | null;

    @Column('character varying', { name: 'zip_code', nullable: true })
    'zip_code': string | null;

    @Column('character varying', { name: 'state', nullable: true })
    'state': string | null;

    @Column('integer', { name: 'skin_color_group_id', nullable: true })
    'skin_color_group_id': number | null;

    @Column('integer', { name: 'ethnicity_id', nullable: true })
    'ethnicity_id': number | null;

    @Column('integer', { name: 'status', nullable: true, default: () => '0' })
    'status': number | null;

    @Column('character varying', { name: 'callback_url', nullable: true })
    'callback_url': string | null;

    @Column('integer', { name: 'is_active', nullable: true })
    'is_active': number | null;

    @Column('character varying', { name: 'code', nullable: true })
    'code': string | null;

    @Column('character varying', { name: 'otp_token', nullable: true })
    'otp_token': string | null;

    @Column('timestamp without time zone', {
        name: 'otp_valid_til',
        nullable: true,
    })
    'otp_valid_til': Date | null;

    @Column('timestamp without time zone', {
        name: 'confirmation_sent_at',
        nullable: true,
    })
    'confirmation_sent_at': Date | null;

    @Column('timestamp without time zone', {
        name: 'confirmed_at',
        nullable: true,
    })
    'confirmed_at': Date | null;

    @Column('character varying', { name: 'unconfirmed_email', nullable: true })
    'unconfirmed_email': string | null;

    @Column('boolean', { name: 'password_update_needed', nullable: true })
    'password_update_needed': boolean | null;

    @Column('boolean', { name: 'hide_for_bc', nullable: true })
    'hide_for_bc': boolean | null;

    @ManyToOne(() => ConsultantShops, (consultantShops: ConsultantShops) => consultantShops.consultants, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'consultant_shop_id', referencedColumnName: 'id' }])
    'consultant_shop': ConsultantShops;

    @ManyToOne(() => ConsultantBranches, (branches: ConsultantBranches) => branches.consultants, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'consultant_branch_id', referencedColumnName: 'id' }])
    'consultant_branch': ConsultantBranches;

    @ManyToOne(() => ConsultantCountries, (countries: ConsultantCountries) => countries.consultants, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'consultant_country_id', referencedColumnName: 'id' }])
    'country_details': ConsultantCountries;

    @OneToMany(() => Customers, (customers: Customers) => customers.conslutant)
    'customers': Customers[];

    @OneToMany(() => Products, (products: Products) => products.consultant)
    'products': Products[];

    @OneToOne(() => ConsultantPositions, (consultantPositions: ConsultantPositions) => consultantPositions.consultant)
    @JoinColumn([{ name: 'consultant_position_id', referencedColumnName: 'id' }])
    'consultant_position': ConsultantPositions;

    @OneToOne(() => ConsultantCompanies, (consultantCompanies: ConsultantCompanies) => consultantCompanies.consultant)
    @JoinColumn([{ name: 'consultant_company_id', referencedColumnName: 'id' }])
    'consultant_company': ConsultantCompanies;

    get 'getProducts'(): object {
        if (this.products) {
            return this.products;
        }
        return null;
    }

    get 'getOpticNumbers'(): string[] | null {
        if (this.products && this.products.length > 0) {
            // Map each product's optic_number to an array
            return this.products.map((product) => product.device.optic_number);
        }
        return [];
    }

    get 'getContryCode'(): string | null {
        if (this.country_details) {
            return this.country_details.code;
        }
        return null;
    }

    get 'getContryName'(): string | null {
        if (this.country_details) {
            return this.country_details.name;
        }
        return null;
    }

    get 'getSerialNumbers'(): string[] | null {
        if (this.products && this.products.length > 0) {
            // Map each product's serial_number to an array
            return this.products.map((product) => product.device.serial_number);
        }
        return [];
    }

    get 'getStoreName'(): string | null {
        if (this.consultant_shop) {
            return this.consultant_shop.name;
        }
        return null;
    }

    get 'getPosition'(): object | null {
        if (this.consultant_position) {
            return {
                id: this.consultant_position.id,
                name: this.consultant_position.name,
            };
        }
        return null;
    }

    @AfterLoad()
    'afterLoad'() {
        this.id = Number(this.id);
        if (this.consultant_company_id) this.consultant_company_id = Number(this.consultant_company_id);
        if (this.consultant_branch_id) this.consultant_branch_id = Number(this.consultant_branch_id);
        if (this.consultant_shop_id) this.consultant_shop_id = Number(this.consultant_shop_id);
        if (this.consultant_position_id) this.consultant_position_id = Number(this.consultant_position_id);
        if (this.consultant_store_id) this.consultant_store_id = Number(this.consultant_store_id);
    }
}
