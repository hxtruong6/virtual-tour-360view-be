import { Module } from '@nestjs/common';

import { AmenitiesController } from './amenities.controller';
import { AmenitiesUseCase } from './amenities.use-case';

@Module({
	controllers: [AmenitiesController],
	providers: [AmenitiesUseCase],
	exports: [AmenitiesUseCase],
})
export class AdminAmenitiesModule {}
