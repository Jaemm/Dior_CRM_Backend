import { IsNumberOrString } from '@/src/common/validators/number-or-string.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

export class GetDevicesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    limit: string;
}

export class ResetConnectDto {
    @ApiProperty()
    @IsNotEmpty()
    @Validate(IsNumberOrString)
    device_id: string | number;
}
