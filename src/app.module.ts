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
import { AdminModule } from './modules/admin/admin.module';
import { HealthCheckerModule } from './modules/health-checker/health-checker.module';
import { PrismaModule } from './prisma/prisma.module';
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

		NestjsFormDataModule,

		HealthCheckerModule,
		PrismaModule,

		AdminModule,
	],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard }],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestContextMiddleware).forRoutes('*'); // Apply to all routes
	}
}
