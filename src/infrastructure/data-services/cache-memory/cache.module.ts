import KeyvRedis from '@keyv/redis';
import { Module } from '@nestjs/common';
import { Keyv } from 'keyv';

import { ApiConfigService } from '../../../shared/services/api-config.service';

@Module({
	providers: [
		{
			provide: 'KEYV_INSTANCE',
			useFactory: (apiConfigService: ApiConfigService) =>
				new Keyv({
					store: new KeyvRedis(apiConfigService.redisUri),
					namespace: `cwgame:${apiConfigService.nodeEnv}`,
				}),
			inject: [ApiConfigService],
		},
	],
	exports: ['KEYV_INSTANCE'],
})
export class CacheModule {}
