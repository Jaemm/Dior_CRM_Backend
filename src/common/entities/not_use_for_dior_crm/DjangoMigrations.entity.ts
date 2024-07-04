import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('django_migrations_pkey', ['id'], { unique: true })
@Entity('django_migrations', { schema: 'public' })
export class DjangoMigrations {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'app', length: 255 })
    app: string;

    @Column('character varying', { name: 'name', length: 255 })
    name: string;

    @Column('timestamp with time zone', { name: 'applied' })
    applied: Date;
}
