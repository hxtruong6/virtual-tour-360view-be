import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DataServicesModule } from '../../infrastructure/data-services/sql/data-services.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		DataServicesModule,
		SharedModule,
		// CacheModule,
	],
	providers: [],
	exports: [],
})
export class CronJobModule {}
