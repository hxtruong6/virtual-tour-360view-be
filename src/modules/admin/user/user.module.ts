import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../../infrastructure/data-services/sql/data-services.module';
import { UserController } from './user.controller';
import { UserUseCase } from './user.use-case';

@Module({
	imports: [DataServicesModule],
	providers: [UserUseCase],
	controllers: [UserController],
	exports: [UserUseCase],
})
export class AdminUserModule {}
