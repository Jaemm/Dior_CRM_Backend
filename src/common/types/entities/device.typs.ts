import { ConsultantCompaniesT } from './consultant_companies.type';

export type DeviceT = {
    id: number | null;
    optic_number: string | null;
    serial_number: string | null;
    docking_number: string | null;
    wb: string | null;
    cal: string | null;
    refresh_date: string | null;
    app_version: string | null;
    app_update_date: Date | null;
    division: string | null;
    use_yn: string | null;
    lat: string | null;
    lng: string | null;
    consultant_company?: ConsultantCompaniesT | null;
};
