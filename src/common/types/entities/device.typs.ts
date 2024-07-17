import { ConsultantCompaniesT } from './consultant_companies.type';

export type DeviceT = {
    id: number | null;
    optic_number: string | null;
    serial_number: string | null;
    docking_number: string | null;
    wb: boolean | null;
    cal: boolean | null;
    refresh_date: Date | null;
    app_version: string | null;
    app_update_date: string | null;
    division: string | null;
    use_yn: string | null;
    lat: string | null;
    lng: string | null;
    consultant_company?: ConsultantCompaniesT | null;
};

export type DeviceForDiorT = Omit<DeviceT, 'consultant_company'> & {
    created_at: Date | null;
    license_period: string | null;
    consultant: {
        id: number | null;
        email: string | null;
        code: string | null;
    } | null;
};
