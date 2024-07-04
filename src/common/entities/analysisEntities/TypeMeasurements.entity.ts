import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Measurements } from './Measurements.entity';

@Index('type_measurements_pkey', ['id'], { unique: true })
@Entity('type_measurements', { schema: 'public' })
export class TypeMeasurements {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: number;

    @Column('character varying', { name: 'name' })
    name: string;

    @OneToMany(() => Measurements, (measurements) => measurements.typeMeasurement)
    measurements: Measurements[];
}
