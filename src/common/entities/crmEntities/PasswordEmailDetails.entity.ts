import { Column, Entity, Index, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

@Index('password_email_details_pkey', ['id'], { unique: true })
@Entity('password_email_details', { schema: 'public' })
export class PasswordEmailDetails {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'email', nullable: true })
    email: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @BeforeInsert()
    insertCreated() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @BeforeUpdate()
    insertUpdated() {
        this.updatedAt = new Date();
    }
}
