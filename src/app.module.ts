import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
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
import { AuthModule } from './modules/auth/auth.module';
import { FilesModule } from './modules/files/files.module';
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

		ServeStaticModule.forRootAsync({
			imports: [SharedModule],
			useFactory: (configService: ApiConfigService) => {
				const storagePath =
					configService.serverStorageFolderConfig.folderName || './uploads';

				return [
					{
						rootPath: path.resolve(storagePath),
						serveRoot: '/uploads',
						exclude: ['/api/v1*'],
					},
				];
			},
			inject: [ApiConfigService],
		}),

		NestjsFormDataModule,

		HealthCheckerModule,
		PrismaModule,
		FilesModule,

		AuthModule,
		AdminModule,
	],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard }],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestContextMiddleware).forRoutes('*'); // Apply to all routes
	}
}
