import { IsNumberOrString } from '@/src/common/validators/number-or-string.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';

export class SkinColorGroupsDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    id: number;
}
