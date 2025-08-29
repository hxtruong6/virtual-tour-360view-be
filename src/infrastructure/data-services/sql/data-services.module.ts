import { Module } from '@nestjs/common';

import { IDataServices } from '../../../core/abstract';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import { CacheService } from '../../../shared/services/cache.service';
import { SharedModule } from '../../../shared/shared.module';
import { DatabaseModule } from '../../database/database.module';
import { CacheModule } from '../cache-memory/cache.module';
import { KyselyDataServices } from '../kysely-data-services.service';

// DatabaseModule is a global module that provides a connection to the database.
@Module({
	imports: [
		CacheModule,
		DatabaseModule.forRootAsync({
			imports: [SharedModule],
			useFactory: (configService: ApiConfigService) => {
				// console.info(
				// 	'configService.databaseOptions',
				// 	configService.databaseOptions,
				// );

				return configService.databaseOptions;
			},
			inject: [ApiConfigService],
		}),
	],
	providers: [
		{
			provide: IDataServices,
			useClass: KyselyDataServices,
		},
		CacheService,
	],
	exports: [DatabaseModule, IDataServices],
})
export class DataServicesModule {}
