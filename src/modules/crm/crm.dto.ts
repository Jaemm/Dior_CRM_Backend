import { IsNumberOrString } from '@/src/common/validators/number-or-string.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

export class CRMDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    id: number;
}

export class UpdateConsentForm {
    @ApiProperty()
    @IsOptional()
    @IsString()
    consent_form_answers: string;

    @ApiProperty()
    @IsNotEmpty()
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
    file_name: string;

    @ApiProperty()
    @IsNotEmpty()
    consent_type: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsNotEmpty()
    customer_id: string;

    @ApiProperty()
    file: string;
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

export class UpdateCrmCustomersDto {
    @ApiProperty()
    @IsOptional()
    email: string;

    @ApiProperty()
    @IsOptional()
    social: string;

    @ApiProperty()
    @IsOptional()
    social_id: string;

    @ApiProperty()
    @IsOptional()
    name: string;

    @ApiProperty()
    @IsOptional()
    os: string;

    @ApiProperty()
    @IsOptional()
    language: string;

    @ApiProperty()
    @IsOptional()
    phone: string;

    @ApiProperty()
    @IsOptional()
    birth: string;

    @ApiProperty()
    @IsOptional()
    address: string;

    @ApiProperty()
    @IsOptional()
    note: string;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    app_id: number;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    company_id: number;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    consultant_id: number;

    @ApiProperty()
    @IsOptional()
    surname: string;

    @ApiProperty()
    @IsOptional()
    gender: string;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    age: number;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    skin_condition: number;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    skin_color_group_id: number;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    ethnicity_id: number;

    @ApiProperty()
    @IsOptional()
    city: string;

    @ApiProperty()
    @IsOptional()
    state: string;

    @ApiProperty()
    @IsOptional()
    zip_code: string;

    @ApiProperty()
    @IsOptional()
    country: string;

    @ApiProperty()
    @IsOptional()
    notes: string;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    is_active: number;

    @ApiProperty()
    @IsOptional()
    image_url: string;

    @ApiProperty()
    @IsOptional()
    @Validate(IsNumberOrString)
    status: number;

    @ApiProperty()
    @IsOptional()
    phone_country_code: string;

    @ApiProperty()
    @IsOptional()
    ipos_consent_url: string;

    @ApiProperty()
    @IsOptional()
    without_ipos_consent_url: string;

    @ApiProperty()
    @IsOptional()
    external_id: string;

    @ApiProperty()
    @IsOptional()
    country_code: string;
}
