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
    phone: string;

    @ApiProperty()
    @IsOptional()
    name: string;

    @ApiProperty()
    @IsOptional()
    surname: string;

    @ApiProperty()
    @IsOptional()
    os: string;

    @ApiProperty()
    @IsOptional()
    language: string;

    @ApiProperty()
    @IsOptional()
    birth: string;

    @ApiProperty()
    @IsOptional()
    gender: string;

    @ApiProperty()
    @IsOptional()
    image_url: string;

    @ApiProperty()
    @IsOptional()
    address: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    app_id: number;

    @ApiProperty()
    @IsOptional()
    age: number;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    skin_color_group_id: number;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
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
    // @Validate(IsNumberOrString)
    @IsOptional()
    phone_country_code: any;

    @ApiProperty()
    @IsOptional()
    country: string;

    @ApiProperty()
    @IsOptional()
    country_code: string;

    @ApiProperty()
    @IsOptional()
    notes: string;

    @ApiProperty()
    @IsOptional()
    country_name: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    company_id: number;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    consultant_id: number;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    external_id: string;

    @ApiProperty()
    @IsOptional()
    email_confirmed: boolean;

    @ApiProperty()
    @IsOptional()
    confirm_token: string;

    @ApiProperty()
    @IsOptional()
    status: number;

    @ApiProperty()
    @IsOptional()
    callback_url: string;

    @ApiProperty()
    @IsOptional()
    is_active: number;

    @ApiProperty()
    @IsOptional()
    code: string;

    @ApiProperty()
    @IsOptional()
    otp_token: string;

    @ApiProperty()
    @IsOptional()
    otp_valid_til: string;

    @ApiProperty()
    @IsOptional()
    countries: string;

    @ApiProperty()
    @IsOptional()
    confirmation_sent_at: Date;

    @ApiProperty()
    @IsOptional()
    confirmed_at: string;

    @ApiProperty()
    @IsOptional()
    unconfirmed_email: string;

    @ApiProperty()
    @IsOptional()
    register_for_crm: boolean;

    @ApiProperty()
    @IsOptional()
    email_subscription: boolean;

    @ApiProperty()
    @IsOptional()
    password: string;
}
