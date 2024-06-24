import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, MinLength, Validate } from "class-validator";
import { IsNumberOrString } from "./common/validators/number-or-string.validator";

export class LoginSocialDto {
    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    app_id: string;

    @ApiProperty()
    @IsString()
    social_provider: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    social_id: string;

    @ApiProperty()
    @Validate(IsNumberOrString)
    consultant_id: string;
}

export class LoginDto {

}

export class ShopListDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    consultant_company_id: number;
}

export class FetchFwVersionDto {
    @ApiProperty()
    @IsString()
    optic_number: string;
}

export class UpdateFwVersionDto {
    @ApiProperty()
    @IsString()
    optic_number: string;

    @ApiProperty()
    @IsString()
    fw_version: string;
}