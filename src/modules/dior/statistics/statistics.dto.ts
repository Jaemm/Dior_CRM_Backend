import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetOverAllDto {
    @IsOptional()
    @IsString()
    start_date: string;

    @IsOptional()
    @IsString()
    end_date: string;
}

export class GetOverAllDetailsDto {
    @IsOptional()
    @IsString()
    type: string;
}

export class GetStatDetailsDto {
    @IsOptional()
    @IsString()
    start_date: string;

    @IsOptional()
    @IsString()
    end_date: string;

    @IsOptional()
    @IsString()
    stat_type: string;
}

export class GetInfographStatDetails {
    @IsOptional()
    @IsString()
    start_date: string;

    @IsOptional()
    @IsString()
    end_date: string;

    @IsOptional()
    @IsString()
    stat_type: string;
}

export class GetStatDetailsCountryWiseDto {
    @IsOptional()
    @IsString()
    stat_type: string;

    @IsOptional()
    @IsString()
    country_name: string;

    @IsOptional()
    @IsString()
    start_date: string;

    @IsOptional()
    @IsString()
    end_date: string;
}
