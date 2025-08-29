import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';
import { NestjsFormDataModule } from 'nestjs-form-data';
import {
	AcceptLanguageResolver,
	HeaderResolver,
	I18nModule,
	QueryResolver,
} from 'nestjs-i18n';
import path from 'node:path';

import { ThrottlerBehindProxyGuard } from './adapters/guards/throttler-behind-proxy.guard';
import './boilerplate.polyfill';
import { API_HEADERS } from './common/constants';
import { getEnvFilePath } from './common/utils';
import { RequestContextMiddleware } from './core/middleware/request-context.middleware';
import { MarketPlaceModule } from './infrastructure/controllers/markets.module';
import { CacheModule } from './infrastructure/data-services/cache-memory/cache.module';
import { DataServicesModule } from './infrastructure/data-services/sql/data-services.module';
import { QueueModule as QueueInfrastructureModule } from './infrastructure/queue/queue.module';
import { AdminModule } from './modules/admin/admin.module';
import { CronJobModule } from './modules/cron-job/cron-job.module';
import { CwGameModule } from './modules/cwgame/cwgame.module';
import { HealthCheckerModule } from './modules/health-checker/health-checker.module';
import { NakamaModule } from './modules/nakama/nakama.module';
import { QueueModule } from './modules/queue/queue.module';
import { ThirdPartyModule } from './modules/third-party/third-party.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';

@Module({
	imports: [
		ClsModule.forRoot({
			global: true,
			middleware: {
				mount: true,
			},
		}),
		ThrottlerModule.forRootAsync({
			imports: [SharedModule],
			useFactory: (configService: ApiConfigService) => {
				return {
					throttlers: [configService.throttlerConfigs],
				};
			},
			inject: [ApiConfigService],
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: getEnvFilePath(),
		}),
		I18nModule.forRootAsync({
			useFactory: (configService: ApiConfigService) => ({
				fallbackLanguage: configService.fallbackLanguage,
				loaderOptions: {
					path: path.join(__dirname, '/i18n/'),
					watch: true,
				},
			}),
			resolvers: [
				{ use: QueryResolver, options: ['lang'] },
				AcceptLanguageResolver,
				new HeaderResolver([API_HEADERS.ACCEPT_LANGUAGE_CODE]),
			],
			inject: [ApiConfigService],
		}),
		BullModule.forRootAsync({
			imports: [SharedModule],
			useFactory: (configService: ApiConfigService) => {
				return {
					connection: {
						url: configService.redisUri,
					},
				};
			},
			inject: [ApiConfigService],
		}),
		// BullBoardModule.forRootAsync({
		// 	imports: [QueueModule],
		// 	useFactory: () => ({
		// 		// name: 'salary-queue',
		// 		adapter: ExpressAdapter,
		// 		// http://127.0.0.1:4000/api/admin/queues
		// 		route: '/admin/queues',
		// 	}),
		// }),
		// ClientsModule.register([
		// 	{
		// 		name: 'NAKAMA_PACKAGE',
		// 		transport: Transport.GRPC,
		// 		options: {
		// 			package: 'nakama.api',
		// 			protoPath: join(__dirname, 'proto/nakama.proto'),
		// 			url: 'localhost:7349', // Nakama gRPC port
		// 		},
		// 	},
		// ]),
		QueueInfrastructureModule,
		CacheModule,
		NestjsFormDataModule,

		HealthCheckerModule,
		// Handle Clean Architecture
		DataServicesModule,

		// grpc
		CwGameModule,
		NakamaModule,

		// http
		AdminModule,
		MarketPlaceModule,
		ThirdPartyModule,

		// Background services
		CronJobModule,
		QueueModule,
	],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard }],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestContextMiddleware).forRoutes('*'); // Apply to all routes
	}
}
