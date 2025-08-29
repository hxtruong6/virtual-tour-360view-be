import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../prisma/prisma.module';
import { ScenesController } from './scenes.controller';
import { ScenesUseCase } from './scenes.use-case';

@Module({
	imports: [PrismaModule],
	controllers: [ScenesController],
	providers: [ScenesUseCase],
	exports: [ScenesUseCase],
})
export class AdminScenesModule {}
