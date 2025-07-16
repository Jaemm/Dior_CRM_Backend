import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateBranchesDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    country: string;

    @IsOptional()
    consultant_branch_id: any;
}

export class SearchBranchesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    per: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    is_bc: boolean;
}

export class UpdateBranchesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    code: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    password: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country: string;
}

export class ExportBranchesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    filter_by: string;
}

export class ImportBranchesDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    file_url: string;
}

export class PresignedUploadForBranchDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    filename: string;
}
