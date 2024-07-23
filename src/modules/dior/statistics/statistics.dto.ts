import { IsOptional, IsString } from 'class-validator';

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
