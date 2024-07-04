import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProductRecommendationSelecteds } from './ProductRecommendationSelecteds.entity';

@Index('product_recommendation_groups_pkey', ['id'], { unique: true })
@Entity('product_recommendation_groups', { schema: 'public' })
export class ProductRecommendationGroups {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('text', {
        name: 'countries',
        nullable: true,
        array: true,
        default: () => "'{}'[]",
    })
    countries: string[] | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @Column('integer', { name: 'consultant_id', nullable: true })
    consultantId: number | null;

    @Column('integer', { name: 'routine', nullable: true })
    routine: number | null;

    @OneToMany(() => ProductRecommendationSelecteds, (prSelecteds) => prSelecteds.prGroup)
    prSelecteds: ProductRecommendationSelecteds[];
}
