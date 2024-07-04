import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('index_sales_groups_on_admin_user_id', ['adminUserId'], {})
@Index('sales_groups_pkey', ['id'], { unique: true })
@Index('index_sales_groups_on_sales_admin_user_id', ['salesAdminUserId'], {})
@Entity('sales_groups', { schema: 'public' })
export class SalesGroups {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'admin_user_id', nullable: true })
    adminUserId: string | null;

    @Column('bigint', { name: 'sales_admin_user_id', nullable: true })
    salesAdminUserId: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
