import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Products } from '../entities/crmEntities';

@Injectable()
export class ProductsRepository extends Repository<Products> {
    constructor(dataSource: DataSource) {
        super(Products, dataSource.createEntityManager());
    }
}
