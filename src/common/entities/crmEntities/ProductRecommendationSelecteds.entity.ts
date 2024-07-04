import { Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ProductRecommendationGroups } from './ProductRecommendationGroups.entity';
import { ProductRecommendations } from './ProductRecommendations.entity';

@Index('product_recommendation_selecteds_pkey', ['id'], { unique: true })
@Entity('product_recommendation_selecteds', { schema: 'public' })
export class ProductRecommendationSelecteds {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('integer', { name: 'batch_id', nullable: true })
    batchId: number | null;

    @Column('integer', { name: 'customer_id', nullable: true })
    customerId: number | null;

    @Column('integer', { name: 'consultant_id', nullable: true })
    consultantId: number | null;

    @Column('integer', { name: 'product_recommendation_id', nullable: true })
    productRecommendationId: number | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @Column('integer', {
        name: 'product_recommendation_group_id',
        nullable: true,
    })
    productRecommendationGroupId: number | null;

    @Column('boolean', { name: 'is_principal', nullable: true, default: false })
    isPrincipal: boolean | null;

    @Column('integer', { name: 'order_number', nullable: true, default: 0 })
    orderNumber: number;

    @Column('integer', { name: 'recommendation_count', nullable: true, default: 0 })
    recommendationCount: number;

    @ManyToOne(() => ProductRecommendationGroups, (prGruop) => prGruop.prSelecteds)
    @JoinColumn([{ name: 'product_recommendation_group_id', referencedColumnName: 'id' }])
    prGroup: ProductRecommendationGroups;

    @OneToMany(() => ProductRecommendations, (productRecommendations) => productRecommendations.prSelecteds)
    productRecommendations: ProductRecommendations[];
}
