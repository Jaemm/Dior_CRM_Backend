import { LicensesResponseDto } from './licenses.response.dto';

export class ProductsResponseDto {
    id: number | null;
    first_use_date: string | null;
    use_date: string | null;
    use_time: string | null;
    mac_address: string | null;
    app_use_yn: string | null;
    license_period: string | null;
    created_at: Date | null;
    is_expired: boolean | null;
    device: object;
    license: LicensesResponseDto;
    application: object;
}
