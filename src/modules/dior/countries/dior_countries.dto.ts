import { IsNotEmpty, IsString } from 'class-validator';

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
