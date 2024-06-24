import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CustomerConsentsDto {
    @ApiProperty()
    @IsString()
    customer_id: string;

    @ApiProperty()
    @IsOptional()
    consultant_id: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    consent_type: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    consent_form_answers: string;

    @ApiProperty()
    // @IsBoolean()
    @IsOptional()
    data_transfer: any; //boolean;

    @ApiProperty()
    // @IsBoolean()
    @IsOptional()
    data_privacy: any;

    @ApiProperty({
        description:
            'I agree that my E-mail address will be used to receive the License termination/renewal notice from Chowis Co., Ltd.',
    })
    // @IsBoolean()
    @IsOptional()
    receive_license_notification: boolean;

    @ApiProperty({
        description:
            'I agree that my E-mail address will be used to receive the news letter and marketing offers on products and services from chowis Co. Ltd.',
    })
    @IsBoolean()
    @IsOptional()
    receive_newsletter: boolean;

    @ApiProperty({
        description: 'Save additional consent information',
    })
    @IsString()
    @IsOptional()
    additional_information: string;
}
