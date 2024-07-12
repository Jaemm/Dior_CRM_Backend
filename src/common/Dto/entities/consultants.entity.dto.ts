import { LicensesEntityDto } from './licenses.entity.dto';
import { ProductsEntityDto } from './products.entity.dto';

export class ConsultantsEntityDto {
    id: number | null;
    email: string | null;
    name: string | null;
    surname: string | null;
    gender: string | null;
    os: string | null;
    language: string | null;
    phone: string | null;
    address: string | null;
    token: string | null;
    city: string | null;
    country: string | null;
    zip_code: string | null;
    state: string | null;
    birthdate: string | null;
    note: string | null;
    push_token: string | null;
    social: string | null;
    memo: string | null;
    app_id: string | null;
    company_name: string | null;
    company_address: string | null;
    branch: string | null;
    position: string | null;
    skin_color_group_id: string | null;
    ethnicity_id: string | null;
    callback_url: string | null;
    code: string | null;
    country_code: string | null;
    store: string | null;
    optic_number: string[] | null;
    password_update_needed: boolean | null;
    licenses: LicensesEntityDto;
    products: ProductsEntityDto;
    consultant_company: object;
    consultant_branch: object;
    consultant_country: object;
    consultant_store: object;
    consultant_shop: object;
    consultant_position: object;

    constructor() {}
}
