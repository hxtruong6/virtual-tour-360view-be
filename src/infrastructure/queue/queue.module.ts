import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ECacheTime, EQueueName } from '../../common/constants';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { DataServicesModule } from '../data-services/sql/data-services.module';

@Global()
@Module({
	imports: [
		// BullModule.registerQueueAsync({
		// 	name: EQueueName.SALARY_QUEUE,
		// 	useFactory: () => ({
		// 		defaultJobOptions: {
		// 			removeOnComplete: {
		// 				count: 100,
		// 				age: 1000 * 60 * 60 * 24 * 15, // 15 days
		// 			},
		// 			removeOnFail: false,
		// 		},
		// 	}),
		// }),
		// BullModule.registerQueueAsync({
		// 	name: EQueueName.NOTIFICATION_QUEUE,
		// 	useFactory: () => ({
		// 		defaultJobOptions: {
		// 			removeOnComplete: {
		// 				count: 100,
		// 				age: 1000 * 60 * 60 * 24 * 15, // 15 days
		// 			},
		// 			removeOnFail: false,
		// 		},
		// 	}),
		// }),
		// BullBoardModule.forFeature({
		// 	name: EQueueName.SALARY_QUEUE,
		// 	adapter: BullMQAdapter, //or use BullAdapter if you're using bull instead of bullMQ
		// }),
		// BullBoardModule.forFeature({
		// 	name: EQueueName.NOTIFICATION_QUEUE,
		// 	adapter: BullMQAdapter,
		// }),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ApiConfigService) => ({
				connection: {
					url: configService.redisUri,
				},
				defaultJobOptions: {
					removeOnComplete: {
						count: 100,
						age: 1000 * 60 * 60 * 24 * 15, // 15 days
					},
					removeOnFail: false, // Delete failed job
					attempts: 5, // Retry 5 times
				},
			}),
			inject: [ApiConfigService],
		}),
		BullBoardModule.forRoot({
			route: '/queues',
			adapter: ExpressAdapter,
		}),
		BullModule.registerQueue({
			name: EQueueName.PROCESS_CW_TOKEN,
		}),
		BullModule.registerQueue({
			name: EQueueName.PROCESS_CW_NFT,
		}),
		BullBoardModule.forFeature({
			name: EQueueName.PROCESS_CW_TOKEN,
			adapter: BullMQAdapter,
		}),
		BullBoardModule.forFeature({
			name: EQueueName.PROCESS_CW_NFT,
			adapter: BullMQAdapter,
		}),
		DataServicesModule,
	],
	providers: [],
	exports: [BullModule], // Export BullModule so other modules can use it
})
export class QueueModule {}
