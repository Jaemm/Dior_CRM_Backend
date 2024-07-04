import { Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductRecommendations } from './ProductRecommendations.entity';

@Index('product_translations_pkey', ['id'], { unique: true })
@Entity('product_translations', { schema: 'public' })
export class ProductTranslations {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', {
        name: 'product_recommendation_id',
        nullable: true,
    })
    productRecommendationId: string | null;

    @Column('character varying', { name: 'field_name', nullable: true })
    fieldName: string | null;

    @Column('character varying', { name: 'language', nullable: true })
    language: string | null;

    @Column('character varying', { name: 'value', nullable: true })
    value: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => ProductRecommendations, (recommendations) => recommendations.productTranslations)
    @JoinColumn([{ name: 'product_recommendation_id', referencedColumnName: 'id' }])
    productRecommendations: ProductRecommendations;
}
