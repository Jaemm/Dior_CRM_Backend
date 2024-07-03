import { Module } from '@nestjs/common';
import { DiorController } from './dior.controller';
import { DiorService } from './dior.service';

@Module({
    imports: [],
    controllers: [DiorController],
    providers: [DiorService],
})
export class DiorModule {}
