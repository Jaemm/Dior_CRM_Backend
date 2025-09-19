import { Module } from '@nestjs/common';
import { DiorCountriesController } from './dior_countries_controller';
import { DiorCountriesService } from './dior_countries.service';
import { ConsultantCountriesRepository, ConsultantsRepository } from '@/src/common/repositories/crm';

@Module({
    imports: [],
    controllers: [DiorCountriesController],
    providers: [
        DiorCountriesService,

        ConsultantsRepository,
        ConsultantCountriesRepository,
    ],
})
export class DiorCountriesModule {}
