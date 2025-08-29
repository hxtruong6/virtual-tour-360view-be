import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../prisma/prisma.module';
import { VirtualToursController } from './virtual-tours.controller';
import { VirtualToursUseCase } from './virtual-tours.use-case';

@Module({
	imports: [PrismaModule],
	providers: [VirtualToursUseCase],
	controllers: [VirtualToursController],
	exports: [VirtualToursUseCase],
})
export class AdminVirtualToursModule {}
