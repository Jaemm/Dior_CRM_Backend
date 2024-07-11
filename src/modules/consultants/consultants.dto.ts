import { IsNumberOrString } from '@/src/common/validators/number-or-string.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, Matches, Validate } from 'class-validator';

export class ConsultantDto {
    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    app_id: string | number;

    @ApiProperty()
    @IsString()
    // @Matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{7,20}$/, {
    //     message: 'Password must contain at least 7 characters, including Upper/lowercase and numbers',
    // })
    password: string;

    // @ApiProperty()
    // @IsString()
    confirmPassword: string;
}
export class UpdateConsultantRubyDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    email: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    password: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    phone: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    name: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    surname: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    phone_country_code: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    language: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    os: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    address: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    country_code: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    app_id: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    consultant_shop_id: string;
}

export class UpdateConsultantDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    email: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    new_password: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    surname: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    os: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    language: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    birthdate: string;

    @ApiProperty()
    @IsOptional()
    address: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    app_id: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    age: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    skin_color_group_id: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    ethnicity_id: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    city: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    state: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    zip_code: string;

    @ApiProperty()
    @IsOptional()
    // @IsString()
    phone_country_code: string;

    @ApiProperty()
    @IsOptional()
    // @IsString()
    country_code: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    gender_id: number;

    @ApiProperty()
    @IsOptional()
    // @Validate(IsNumberOrString)
    consultant_shop_id: string;

    // @ApiProperty()
    // @IsOptional()
    // @IsString()
    // password: string;

    // @ApiProperty()
    // @IsOptional()
    // confirm_password: string;

    // @ApiProperty()
    // @IsOptional()
    // consultant_company_id: number;

    // @ApiProperty()
    // @IsOptional()
    // consultant_branch_id: number;

    // @ApiProperty()
    // @IsOptional()
    // consultant_position_id: number;

    // @ApiProperty()
    // @IsOptional()
    // token: string;

    // @ApiProperty()
    // @IsOptional()
    // password_digest: string;

    // @ApiProperty()
    // @IsOptional()
    // recovery_password_digest: string;

    // @ApiProperty()
    // @IsOptional()
    // social: string;

    // @ApiProperty()
    // @IsOptional()
    // social_id: number;

    // @ApiProperty()
    // @IsOptional()
    // note: string;

    // @ApiProperty()
    // @IsOptional()
    // push_token: string;

    // @ApiProperty()
    // @IsOptional()
    // approved: string;

    // @ApiProperty()
    // @IsOptional()
    // country_name: string;

    // @ApiProperty()
    // @IsOptional()
    // country_id: string;

    // @ApiProperty()
    // @IsOptional()
    // consultant_store_id: number;

    // @ApiProperty()
    // @IsOptional()
    // email_confirmed: string;

    // @ApiProperty()
    // @IsOptional()
    // confirm_token: string;

    // @ApiProperty()
    // @IsOptional()
    // memo: string;

    // @ApiProperty()
    // @IsOptional()
    // company_name: string;

    // @ApiProperty()
    // @IsOptional()
    // company_address: string;

    // @ApiProperty()
    // @IsOptional()
    // position: string;

    // @ApiProperty()
    // @IsOptional()
    // branch: string;

    // @ApiProperty()
    // @IsOptional()
    // status: string;

    // @ApiProperty()
    // @IsOptional()
    // callback_url: string;

    // @ApiProperty()
    // @IsOptional()
    // is_active: string;

    // @ApiProperty()
    // @IsOptional()
    // code: string;

    // @ApiProperty()
    // @IsOptional()
    // otp_token: string;

    // @ApiProperty()
    // @IsOptional()
    // otp_valid_til: string;

    // @ApiProperty()
    // @IsOptional()
    // countries: string;

    // @ApiProperty()
    // @IsOptional()
    // confirmation_sent_at: Date;

    // @ApiProperty()
    // @IsOptional()
    // confirmed_at: string;

    // @ApiProperty()
    // @IsOptional()
    // unconfirmed_email: string;

    // @ApiProperty()
    // @IsOptional()
    // register_for_crm: string;

    // @ApiProperty()
    // @IsOptional()
    // email_subscription: string;
}

export function singleStringToArray(value: string | string[]): string[] {
    return typeof value === 'string' ? [value] : value;
}

export class GetConsultantDto {
    @IsString()
    @IsOptional()
    company_ids: string;

    @IsString()
    @IsOptional()
    branch_ids: string;

    @IsString()
    @IsOptional()
    shop_ids: string;

    @IsString()
    @IsOptional()
    position_ids: string;

    @IsString()
    @IsOptional()
    country_ids: string;

    @IsString()
    @IsOptional()
    store_ids: string;
}

export class ResendConfirmationDto {
    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    app_id: string;
}

export class ChangeEmailDto {
    @ApiProperty()
    @IsString()
    email: string;
}

export class PasswordDto {
    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    app_id: string;
}

export class PasswrodChangeDto {
    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    new_password: string;
}

export class ConfirmHtmlDto {
    @ApiProperty()
    @IsString()
    token: string;
}

export class ConfirmHtmlIdDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    id: string;
}

export class ConsultantCompanyDetailsDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    consultant_company_id: string;
}

class BatchDto {
    @ApiProperty({ type: String })
    @IsString()
    analysis_type: string;

    @ApiProperty({ type: String })
    @Validate(IsNumberOrString)
    batch_id: string;
}

export class RequestCallBackUrlDto {
    @ApiProperty({
        type: BatchDto,
        isArray: true,
    })
    @IsArray()
    batch_ids: BatchDto[];
}

export class AllLicenseDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    application_id: string;

    @ApiProperty()
    @IsString()
    optic_number: string;
}

export class ChangeLicenseDto {
    @ApiProperty()
    @IsString()
    optic_number: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    license_id: string;
}

export class NotifySalesChangeLicenseDto {
    @ApiProperty()
    @IsString()
    optic_number: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    license_id: string;
}

export class CalculatePriceDto {
    @ApiProperty({
        description: 'Optic number comma seprated like 1,2,3',
        type: String,
    })
    @IsString()
    optic_number: string;

    @ApiPropertyOptional({
        enum: ['days', 'months', 'years'],
        description: 'time Type(it can be days, months, years and only needed for extend)',
    })
    @IsOptional()
    @IsString()
    time_type: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    duration: string;

    @ApiProperty({
        enum: ['change', 'extend'],
        description: 'it can be change or extend',
        default: 'change',
    })
    @IsString()
    selection_type: string;

    @ApiPropertyOptional()
    @Validate(IsNumberOrString)
    @IsOptional()
    license_id: string;
}

export class UpdateLicenseDto {
    @ApiProperty()
    @IsString()
    optic_number: string;

    @ApiProperty()
    @IsString()
    duration: string;

    @ApiProperty({
        enum: ['days', 'months', 'years'],
        description: 'time Type(it can be days, months, years and only needed for extend)',
        default: 'days',
    })
    @IsString()
    time_type: string;
}

export class RenewDevicesDto {
    @ApiProperty({
        description: 'Optic number comma seprated like 1,2,3',
        type: String,
        isArray: true,
    })
    @IsArray()
    @IsString({ each: true })
    optic_numbers: string;

    @ApiProperty({
        enum: ['days', 'months', 'years'],
        description: 'time Type(it can be days, months, years and only needed for extend)',
        default: 'days',
    })
    @IsString()
    time_type: string;

    @ApiProperty()
    @IsString()
    duration: string;

    @ApiProperty({
        enum: ['true', 'false'],
    })
    @IsString()
    submit_license_extension: string;
}

export class LoginSocialDto {
    @ApiProperty()
    @IsString()
    social_provider: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    social_id: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    app_id: string;

    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    name: string;
}

export class LoginPhoneDto {
    @ApiProperty()
    @IsString()
    phone: string;
}

export class ProductRecommendationsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    limit: string;
}

export class HealthTipsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    app_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    limit: string;
}

export class HealthTipsByCompanyDto {
    @ApiPropertyOptional()
    @IsNotEmpty()
    @IsString()
    company_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    app_id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    page: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    limit: string;
}

export class TokenRefreshDto {
    @ApiProperty()
    @IsString()
    refresh_token: string;

    @ApiProperty()
    @IsString()
    token: string;
}

export class NotificationTestDto {
    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    content: string;
}

export class EnterProductDto {
    @ApiProperty()
    @IsOptional()
    optic_number: string;

    @ApiProperty()
    @IsOptional()
    password: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    @IsOptional()
    application_id: string;

    @ApiProperty()
    @IsOptional()
    mac_address: string;

    @ApiProperty()
    @IsOptional()
    first_use_date: string;

    @ApiProperty()
    @IsOptional()
    lat: string;

    @ApiProperty()
    @IsOptional()
    lng: string;
}

export class GetNotificationsDto {
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
    title: string;
}

export class UpdatePasswordDto {
    @ApiProperty()
    @IsString()
    app_id: string;

    @ApiProperty()
    @IsString()
    recoveryPasswordToken: string;

    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    confirmPassword: string;
}
