import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { ProductAttributeTranslations } from './ProductAttributeTranslations.entity';

@Index('product_attributes_pkey', ['id'], { unique: true })
@Entity('product_attributes', { schema: 'public' })
export class ProductAttributes {
    @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
    id: string;

    @Column('character varying', { name: 'typ', nullable: true })
    typ: string | null;

    @Column('character varying', { name: 'value', nullable: true })
    value: string | null;

    @Column('timestamp without time zone', { name: 'created_at' })
    createdAt: Date;

    @Column('timestamp without time zone', { name: 'updated_at' })
    updatedAt: Date;

    @Column('integer', { name: 'consultant_company_id', nullable: true })
    consultantCompanyId: number | null;

    @OneToMany(() => ProductAttributeTranslations, (translation) => translation.productAttributes)
    productAttributeTranslations: ProductAttributeTranslations[];
}
