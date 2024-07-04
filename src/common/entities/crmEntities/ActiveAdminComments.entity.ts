import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('index_active_admin_comments_on_author_type_and_author_id', ['authorId', 'authorType'], {})
@Index('active_admin_comments_pkey', ['id'], { unique: true })
@Index('index_active_admin_comments_on_namespace', ['namespace'], {})
@Index('index_active_admin_comments_on_resource_type_and_resource_id', ['resourceId', 'resourceType'], {})
@Entity('active_admin_comments', { schema: 'public' })
export class ActiveAdminComments {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'namespace', nullable: true })
    namespace: string | null;

    @Column('text', { name: 'body', nullable: true })
    body: string | null;

    @Column('character varying', { name: 'resource_type', nullable: true })
    resourceType: string | null;

    @Column('bigint', { name: 'resource_id', nullable: true })
    resourceId: string | null;

    @Column('character varying', { name: 'author_type', nullable: true })
    authorType: string | null;

    @Column('bigint', { name: 'author_id', nullable: true })
    authorId: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;
}
