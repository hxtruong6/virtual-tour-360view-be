import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../prisma/prisma.module';
import { HotspotsController } from './hotspots.controller';
import { HotspotsUseCase } from './hotspots.use-case';

@Module({
	imports: [PrismaModule],
	controllers: [HotspotsController],
	providers: [HotspotsUseCase],
	exports: [HotspotsUseCase],
})
export class AdminHotspotsModule {}
