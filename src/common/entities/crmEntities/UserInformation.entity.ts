import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConsultantCompanies } from './ConsultantCompanies.entity';
import { Countries } from './Countries.entity';
import { AdminUsers } from './AdminUsers.entity';

@Index('user_information_pkey', ['id'], { unique: true })
@Entity('user_information', { schema: 'public' })
export class UserInformation {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: number;

    @Column('character varying', { name: 'company_name', nullable: true })
    companyName: string | null;

    @Column('character varying', {
        name: 'company_registration_number',
        nullable: true,
    })
    companyRegistrationNumber: string | null;

    @Column('character varying', { name: 'legal_address', nullable: true })
    legalAddress: string | null;

    @Column('character varying', { name: 'phone_number', nullable: true })
    phoneNumber: string | null;

    @Column('character varying', { name: 'email_address', nullable: true })
    emailAddress: string | null;

    @Column('character varying', { name: 'email_address-sub1', nullable: true })
    emailAddressSub1: string | null;

    @Column('character varying', { name: 'email_address-sub2', nullable: true })
    emailAddressSub2: string | null;

    @Column('character varying', { name: 'email_address-sub3', nullable: true })
    emailAddressSub3: string | null;

    @Column('character varying', { name: 'email_address-sub4', nullable: true })
    emailAddressSub4: string | null;

    @Column('character varying', { name: 'email_address-sub5', nullable: true })
    emailAddressSub5: string | null;

    @Column('bigint', { name: 'consultant_id', nullable: true })
    consultantId: number | null;

    @Column('bigint', { name: 'agent_id', nullable: true })
    agentId: string | null;

    @Column('character varying', { name: 'post_code', nullable: true })
    postCode: string | null;

    @Column('character varying', { name: 'city', nullable: true })
    city: string | null;

    @Column('character varying', { name: 'attn', nullable: true })
    attn: string | null;

    @ManyToOne(() => ConsultantCompanies, (consultantCompanies) => consultantCompanies.userInformations)
    @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
    company: ConsultantCompanies;

    @ManyToOne(() => AdminUsers, (adminUsers) => adminUsers.userInformations, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
    user: AdminUsers;
}
