import { Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ProductRecommendationSelecteds } from './ProductRecommendationSelecteds.entity';
import { ProductTranslations } from './ProductTranslations.entity';
import { Consultants } from './Consultants.entity';

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
    //
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

    @Column('integer', { name: 'recommendation_count', nullable: true })
    recommendationCount: number | null;

    @OneToMany(() => ProductRecommendationSelecteds, (prSelecteds) => prSelecteds.productRecommendation)
    prSelecteds: ProductRecommendationSelecteds[];

    @OneToMany(() => ProductTranslations, (translations) => translations.productRecommendations)
    productTranslations: ProductTranslations[];

    @ManyToOne(() => Consultants, (consultant) => consultant.productRecommendations)
    @JoinColumn([{ name: 'consultant_id', referencedColumnName: 'id' }])
    consultant: Consultants;

    @ManyToOne(() => ProductRecommendations, (productRecommendation) => productRecommendation.productVariants, {
        nullable: true,
    })
    @JoinColumn([{ name: 'product_recommendation_id', referencedColumnName: 'id' }])
    productVariant: ProductRecommendations;

    @OneToMany(() => ProductRecommendations, (productRecommendation) => productRecommendation.productVariant)
    productVariants: ProductRecommendations[];

    isMarketMatch(market: string): boolean {
        const arr = this.countries.map((country) => country.toLowerCase());

        return arr.includes('world wide') || arr.includes(market.toLowerCase());
    }

    get getBasicInfo() {
        return {
            id: Number(this.id),
            product_type: this.productType,
            description: this.description,
            link: this.link,
            image_url: this.imageUrl,
            code: this.code,
            routine: this.routine,
            collection: this.collection,
            category: this.category,
            countries: this.countries,
            product_recommendation_id: this.productRecommendationId,
        };
    }

    get getVariants() {
        let variants: any[] = [];
        if (this.productVariants && this.productVariants.length > 0) {
            variants = this.productVariants.reverse().map((v) => {
                return {
                    id: Number(v.id),
                    name: v.name,
                    product_type: v.productType,
                    description: v.description,
                    link: v.link,
                    image_url: v.imageUrl,
                    code: v.code,
                    routine: v.routine,
                    collection: v.collection,
                    category: v.category,
                    countries: v.countries,
                    product_recommendation_id: v.productRecommendationId,
                    shades: v.shades,
                };
            });
        }
        return variants;
    }

    getSkinToneFromProduct(skinTone: string) {
        if (!this.productVariant) {
            return this;
        }
        const parentProduct = this.productVariant;

        const productWithSkinTone = parentProduct.productVariants.find((variants) => variants.shades === skinTone);

        if (!productWithSkinTone) {
            return parentProduct;
        }

        return productWithSkinTone;
    }

    getNewSkinToneFromProduct(skinTone: string) {
        let productWithSkinTone;
        if (!this.productVariant) {
            const parentProduct = this;
            productWithSkinTone = parentProduct.productVariants.find((variants) => variants.shades === skinTone);

            if (!productWithSkinTone) {
                productWithSkinTone = this;
            }
        } else {
            const parentProduct = this.productVariant;

            productWithSkinTone = parentProduct.productVariants.find((variants) => variants.shades === skinTone);

            if (!productWithSkinTone) {
                productWithSkinTone = parentProduct;
            }
        }

        return productWithSkinTone;
    }

    getShade() {
        if (this.productVariants && this.productVariants.length > 0) {
            return 'Select Shade';
        }

        return this.shades;
    }
}
