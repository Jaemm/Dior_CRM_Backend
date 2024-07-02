import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
// import { AdminUsers } from './AdminUsers.entity';

@Index('index_agent_customizations_on_agent_id', ['agentId'], {})
@Index('agent_customizations_pkey', ['id'], { unique: true })
@Entity('agent_customizations', { schema: 'public' })
export class AgentCustomizations {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('bigint', { name: 'agent_id', nullable: true })
    agentId: string | null;

    @Column('boolean', {
        name: 'channel_io',
        nullable: true,
        default: () => 'false',
    })
    channelIo: boolean | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    // @ManyToOne(() => AdminUsers, (adminUsers) => adminUsers.agentCustomizations)
    // @JoinColumn([{ name: "agent_id", referencedColumnName: "id" }])
    // agent: AdminUsers;
}
