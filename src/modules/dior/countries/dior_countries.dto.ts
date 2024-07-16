import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCountries {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    url_and_port: string;

    @IsNotEmpty()
    @IsString()
    default_recommendation: string;
}

export class UpdateCountriesDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    code: string;

    @IsOptional()
    @IsString()
    url_and_port: string;

    @IsOptional()
    @IsString()
    default_recommendation: string;
}
