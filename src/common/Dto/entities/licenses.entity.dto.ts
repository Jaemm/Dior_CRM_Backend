import { Licenses } from '../../entities/crmEntities/Licenses.entity';

export class LicensesEntityDto {
    id: number | null;
    name: string | null;

    constructor(data: Licenses) {
        this.id = data.id;
        this.name = data.name;
    }
}
