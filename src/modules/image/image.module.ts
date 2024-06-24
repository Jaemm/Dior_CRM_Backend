import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt/dist';
import { ImageController } from './imge.controller';
import { AwsS3Service } from 'src/common/awsS3/awsS3.service';

@Module({
    imports: [],
    providers: [AwsS3Service],
    controllers: [ImageController],
    exports: [],
})
export class ImageModule {}

