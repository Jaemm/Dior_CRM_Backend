import { IsNumberOrString } from '@/src/common/validators/number-or-string.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsString, Validate } from 'class-validator';

export class ApplicationsDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    id: number;
}

export class ApplicationsVersionCheckDto {
    @ApiProperty()
    @Validate(IsNumberOrString)
    app_id: string;

    @ApiProperty({
        enum: ['ios', 'aos'],
    })
    @Transform(({ value }) => value.toLowerCase())
    @IsString()
    @IsIn(['ios', 'aos'])
    operating_system: string;
}
