import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('do_brand_pkey', ['id'], { unique: true })
@Entity('do_brand', { schema: 'public' })
export class DoBrand {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;

    @Column('character varying', { name: 'brand_name' })
    brandName: string;
}
