/* eslint-disable unicorn/import-style */
import {
	CallHandler,
	ClassSerializerInterceptor,
	ExecutionContext,
	HttpStatus,
	Injectable,
	NestInterceptor,
	UnprocessableEntityException,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import {
	ExpressAdapter,
	type NestExpressApplication,
} from '@nestjs/platform-express';
import { instanceToPlain } from 'class-transformer';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { WinstonModule } from 'nest-winston';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import sortKeys from 'sort-keys';

import { LanguageInterceptor } from './adapters/interceptors/language-interceptor.service';
import { TranslationInterceptor } from './adapters/interceptors/translation-interceptor.service';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { GrpcExceptionFilter } from './common/filters/grpc-exception.filter';
import { setupSwagger } from './setup-swagger';
import { ApiConfigService } from './shared/services/api-config.service';
import { CustomLoggerService } from './shared/services/custom-logger.service';
import { RequestContextService } from './shared/services/request-context.service';
import { TranslationService } from './shared/services/translation.service';
import { SharedModule } from './shared/shared.module';

// interceptor sort all objects by keys before sending to client
@Injectable()
export class SortInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle().pipe(
			map((data) => {
				if (typeof data === 'object' && data !== null) {
					return sortKeys(instanceToPlain(data), { deep: true });
				}

				return data as unknown;
			}),
		);
	}
}

export async function bootstrap(): Promise<NestExpressApplication> {
	const app = await NestFactory.create<NestExpressApplication>(
		AppModule,
		new ExpressAdapter(),
	);

	// Enable CORS only in development mode
	// if (process.env.NODE_ENV !== 'production') {
	app.enableCors({
		origin: [
			'http://localhost:3031',
			'http://localhost:3030',
			'https://cms.cwgame.io',
			'https://world.cwgame.io',
			'https://cwgame.io',
		],
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'Accept',
			'Origin',
			'X-Requested-With',
			'Access-Control-Request-Method',
			'Access-Control-Request-Headers',
			'x-api-key',
		],
		credentials: true,
	});
	// }

	app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
	app.setGlobalPrefix('/api'); // use api as global prefix if you don't have subdomain
	app.use(helmet());
	app.use(compression());
	app.use(morgan('combined'));
	app.enableVersioning({ type: VersioningType.URI });

	// Setup config service
	const configService = app.select(SharedModule).get(ApiConfigService);
	const reflector = app.get(Reflector);
	// const { httpAdapter } = app.get(HttpAdapterHost);

	// Set up exception filters in correct order
	// Add gRPC filter FIRST if enabled
	if (configService.grpcConfig.enabled) {
		app.useGlobalFilters(new GrpcExceptionFilter());
	}

	// Then add HTTP filter
	app.useGlobalFilters(
		new AllExceptionsFilter(
			app.get(HttpAdapterHost),
			app.select(SharedModule).get(TranslationService),
		),
		// new HttpExceptionFilter(reflector),
		// new QueryFailedFilter(reflector), # for typeorm
	);

	app.useGlobalInterceptors(
		new ClassSerializerInterceptor(reflector),
		new LanguageInterceptor(),
		new TranslationInterceptor(
			app.select(SharedModule).get(TranslationService),
		),
		new SortInterceptor(),
	);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			// transformOptions: {
			// 	enableImplicitConversion: true,
			// },
			// forbidNonWhitelisted: true,
			errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			transform: true,
			dismissDefaultMessages: true,
			exceptionFactory: (errors) => new UnprocessableEntityException(errors),
		}),
	);

	// Setup request context service with logger
	const requestContextService = app
		.select(SharedModule)
		.get(RequestContextService);

	const customLoggerService = new CustomLoggerService(requestContextService);

	app.useLogger(
		WinstonModule.createLogger(customLoggerService.createLoggerConfig),
	);

	if (configService.documentationEnabled) {
		setupSwagger(app);
	}

	// Starts listening for shutdown hooks
	if (!configService.isDevelopment) {
		app.enableShutdownHooks();
	}

	const port = configService.appConfig.port;
	await app.listen(port, '0.0.0.0'); // 127.0.0.1 = localhost, 0.0.0.0 = all interfaces
	// 0.0.0.0 is used to bind the app to all network interfaces (for docker)

	console.info(`Server running on ${await app.getUrl()}`);

	return app;
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void bootstrap();
