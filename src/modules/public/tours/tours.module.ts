import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../prisma/prisma.module';
import { PublicToursController } from './tours.controller';
import { PublicToursUseCase } from './tours.use-case';

@Module({
	imports: [PrismaModule],
	controllers: [PublicToursController],
	providers: [PublicToursUseCase],
	exports: [PublicToursUseCase],
})
export class PublicToursModule {}
