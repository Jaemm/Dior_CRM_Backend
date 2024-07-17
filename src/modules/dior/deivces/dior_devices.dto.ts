import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetDevicesDto {
    @IsOptional()
    @IsString()
    search: string;

    @IsOptional()
    @IsString()
    page: string;

    @IsOptional()
    @IsString()
    limit: string;
}

export class ResetConnectDto {
    @IsNotEmpty()
    @IsString()
    device_id: string;
}
