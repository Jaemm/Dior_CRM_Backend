import { IsNumberOrString } from '@/src/common/validators/number-or-string.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Validate } from 'class-validator';

export class ExpirationCheckDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    consultant_company_id: string | number;

    @ApiProperty()
    @Validate(IsNumberOrString)
    service_id: string | number;
}
