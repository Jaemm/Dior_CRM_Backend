import { Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ProductRecommendationSelecteds } from './ProductRecommendationSelecteds.entity';
import { ProductTranslations } from './ProductTranslations.entity';

@Index('product_recommendations_pkey', ['id'], { unique: true })
@Entity('product_recommendations', { schema: 'public' })
export class ProductRecommendations {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'product_type', nullable: true })
    productType: string | null;

    @Column('character varying', { name: 'name', nullable: true })
    name: string | null;

    @Column('character varying', { name: 'link', nullable: true })
    link: string | null;

    @Column('text', { name: 'description', nullable: true })
    description: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @Column('integer', { name: 'consultant_company_id', nullable: true })
    consultantCompanyId: number | null;

    @Column('integer', { name: 'consultant_id', nullable: true })
    consultantId: number | null;

    @Column('character varying', { name: 'image_url', nullable: true })
    imageUrl: string | null;

    @Column('character varying', { name: 'category', nullable: true })
    category: string | null;

    @Column('character varying', { name: 'collection', nullable: true })
    collection: string | null;

    @Column('character varying', { name: 'routine', nullable: true })
    routine: string | null;

    @Column('character varying', { name: 'code', nullable: true })
    code: string | null;

    @Column('text', {
        name: 'countries',
        nullable: true,
        array: true,
        default: () => "'{}'[]",
    })
    countries: string[] | null;

    @Column('integer', { name: 'product_recommendation_id', nullable: true })
    productRecommendationId: number | null;

    @Column('character varying', { name: 'shades', nullable: true })
    shades: string | null;

    @ManyToOne(() => ProductRecommendationSelecteds, (prSelecteds) => prSelecteds.productRecommendations)
    @JoinColumn([{ name: 'product_recommendation_id', referencedColumnName: 'productRecommendationId' }])
    prSelecteds: ProductRecommendationSelecteds[];

    @OneToMany(() => ProductTranslations, (translations) => translations.productRecommendations)
    productTranslations: ProductTranslations[];
}
