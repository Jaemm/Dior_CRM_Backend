export type ConsultantCountryT = {
    id: number | null;
    consultant_branch_id: number | null;
    name: string | null;
    code: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    consultant_company_id: number | null;
    url_and_port: string | null;
    default_recommendation: string | null;
};

export type ConsultantCountryForDiorT = Omit<
    ConsultantCountryT,
    'consultant_branch_id' | 'consultant_company_id' | 'created_at' | 'updated_at'
>;
