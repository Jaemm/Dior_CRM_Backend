import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsS3Service } from './awsS3.service';

@Module({
    providers: [AwsS3Service, ConfigService],
})
export class AwsS3Module {}
