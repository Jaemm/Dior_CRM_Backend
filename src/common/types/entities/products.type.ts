import { ApplicationT } from './applications.type';
import { DeviceT } from './device.typs';
import { LicensesT } from './licenses.type';

export type ProductsT = {
    id: number | null;
    first_use_date: string | null;
    use_date: string | null;
    use_time: string | null;
    mac_address: string | null;
    app_use_yn: string | null;
    license_period: number | null;
    created_at: Date | null;
    is_expired: boolean | null;
    device?: DeviceT | null;
    license?: LicensesT | null;
    application?: ApplicationT | null;
};
