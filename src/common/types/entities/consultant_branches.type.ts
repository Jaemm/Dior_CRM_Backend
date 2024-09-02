export type ConsultantBranchesT = {
    id: number | null;
    consultant_company_id: number | null;
    name: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    code: string | null;
    email: string | null;
    password: string | null;
    country: string | null;
    consultant_country_id: number | null;
};

export type ConsultantBranchesForDiorT = {
    id: number | null;
    name: string | null;
    code: string | null;
    email: string | null;
    created_at: Date | null;
    country: string | null;
    password: string | null;
    total_devices: number | null;
    last_consultation_date: string | null;
};
