import { IsNumberOrString } from '@/src/common/validators/number-or-string.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

export class CRMDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    id: number;
}

export class UpdateConsentForm {
    @ApiPropertyOptional()
    @IsOptional()
    consent_form_answers: any;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    customer_id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    consent_type: string;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    batch_id: string;

    @ApiProperty()
    @IsString()
    url: string;
}

export class CustomerSyncDto {
    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsString()
    phone_number: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    customer_id: string;

    @ApiProperty()
    @IsArray()
    diagnosis_info: DiagnosisInfo[];
}

class DiagnosisInfo {
    batch_id: number;
    measurements: Measurement[];
}

class Measurement {
    measurement_value: string;
    original_image: string;
    result_image: string;
}

export class PresignedUploadDto {
    @ApiProperty()
    @IsNotEmpty()
    consent_type: string;

    // @ApiProperty()
    // @Validate(IsNumberOrString)
    // @IsNotEmpty()
    // customer_id: string;
}

export class GetByEmailDto {
    @ApiProperty()
    @IsString()
    email: string;
}

export class GetCustomerDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    page: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    per: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    surname: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search: string;
}

export class CreateCrmCustomerDto {
    // @ApiProperty()
    // @IsNotEmpty()
    // @Validate(IsNumberOrString)
    // consultant_id: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    email: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    app_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    social: string;

    @ApiPropertyOptional()
    @IsOptional()
    social_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    os: string;

    @ApiPropertyOptional()
    @IsOptional()
    language: string;

    @ApiPropertyOptional()
    @IsOptional()
    birth: string;

    @ApiPropertyOptional()
    @IsOptional()
    address: string;

    @ApiPropertyOptional()
    @IsOptional()
    note: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    company_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    surname: string;

    @ApiPropertyOptional()
    @IsOptional()
    gender: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    age: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    skin_condition: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    skin_color_group_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    ethnicity_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    city: string;

    @ApiPropertyOptional()
    @IsOptional()
    state: string;

    @ApiPropertyOptional()
    @IsOptional()
    zip_code: string;

    @ApiPropertyOptional()
    @IsOptional()
    country: string;

    @ApiPropertyOptional()
    @IsOptional()
    notes: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    is_active: number;

    @ApiPropertyOptional()
    @IsOptional()
    image_url: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    status: number;

    @ApiPropertyOptional()
    @IsOptional()
    phone_country_code: string;

    @ApiPropertyOptional()
    @IsOptional()
    ipos_consent_url: string;

    @ApiPropertyOptional()
    @IsOptional()
    without_ipos_consent_url: string;

    @ApiPropertyOptional()
    @IsOptional()
    external_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    country_code: string;
}

export class UpdateCrmCustomersDto {
    @ApiPropertyOptional()
    @IsOptional()
    email: string;

    @ApiPropertyOptional()
    @IsOptional()
    social: string;

    @ApiPropertyOptional()
    @IsOptional()
    social_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    os: string;

    @ApiPropertyOptional()
    @IsOptional()
    language: string;

    @ApiPropertyOptional()
    @IsOptional()
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    birth: string;

    @ApiPropertyOptional()
    @IsOptional()
    address: string;

    @ApiPropertyOptional()
    @IsOptional()
    note: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    app_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    company_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    consultant_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    surname: string;

    @ApiPropertyOptional()
    @IsOptional()
    gender: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    age: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    skin_condition: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    skin_color_group_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    ethnicity_id: number;

    @ApiPropertyOptional()
    @IsOptional()
    city: string;

    @ApiPropertyOptional()
    @IsOptional()
    state: string;

    @ApiPropertyOptional()
    @IsOptional()
    zip_code: string;

    @ApiPropertyOptional()
    @IsOptional()
    country: string;

    @ApiPropertyOptional()
    @IsOptional()
    notes: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    is_active: number;

    @ApiPropertyOptional()
    @IsOptional()
    image_url: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Validate(IsNumberOrString)
    status: number;

    @ApiPropertyOptional()
    @IsOptional()
    phone_country_code: string;

    @ApiPropertyOptional()
    @IsOptional()
    ipos_consent_url: string;

    @ApiPropertyOptional()
    @IsOptional()
    without_ipos_consent_url: string;

    @ApiPropertyOptional()
    @IsOptional()
    external_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    country_code: string;
}
