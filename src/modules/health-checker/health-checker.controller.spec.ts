/* eslint-disable unicorn/import-style */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// eslint-disable-next-line unicorn/import-style
import { type INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthCheckError, TerminusModule } from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';
import { I18nModule, I18nService } from 'nestjs-i18n';
import { join } from 'node:path';
import request from 'supertest';

import { getEnvFilePath } from '../../common/utils';
import { Database } from '../../infrastructure/database/database';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { TranslationService } from '../../shared/services/translation.service';
import { HealthCheckerModule } from './health-checker.module';
import { DatabaseHealthIndicator } from './health-indicators/database.indicator';

describe('HealthCheckerController', () => {
	let app: INestApplication;
	let db: Database;

	beforeEach(async () => {
		db = {
			connection: jest.fn().mockReturnValue({
				execute: jest.fn().mockImplementation(async (cb) => cb()),
			}),
		} as unknown as Database;

		const translationService = {
			translate: jest.fn().mockResolvedValue('translated text'),
			translateNecessaryKeys: jest.fn().mockResolvedValue('translated text'),
		};

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				TerminusModule,
				HealthCheckerModule,
				ConfigModule.forRoot({
					isGlobal: true,
					envFilePath: getEnvFilePath(),
				}),
				DatabaseModule.forRootAsync({
					imports: [ConfigModule],
					inject: [ConfigService],
					useFactory: (configService: ConfigService) => ({
						host: configService.get('DB_HOST', 'localhost'),
						port: configService.get('DB_PORT', 5432),
						username: configService.get('DB_USERNAME', 'postgres'),
						password: configService.get('DB_PASSWORD', 'password'),
						database: configService.get('DB_DATABASE', 'postgres'),
					}),
				}),
				I18nModule.forRoot({
					fallbackLanguage: 'en',
					loaderOptions: {
						path: join(__dirname, '../../i18n/'),
						watch: true,
					},
				}),
			],
			providers: [
				{
					provide: Database,
					useValue: db,
				},
				DatabaseHealthIndicator,
				{
					provide: I18nService,
					useValue: {
						translate: jest.fn().mockResolvedValue('translated text'),
					},
				},
				{
					provide: TranslationService,
					useValue: translationService,
				},
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		await app?.close();
	});

	it('/health (GET)', async () => {
		const result = {
			version: 'PostgreSQL 12.3',
		};

		db.connection = jest.fn().mockReturnValue({
			execute: jest.fn().mockResolvedValue({ rows: [result] }),
		});

		return request(app.getHttpServer())
			.get('/health')
			.expect(200)
			.expect((res) => {
				expect(res.body).toHaveProperty('status', 'ok');
				// expect(res.body.info).toHaveProperty('kysely-pg-database');
				// expect(res.body.info['kysely-pg-database']).toHaveProperty(
				// 	'status',
				// 	'up',
				// );
			});
	});
});

describe('DatabaseHealthIndicator', () => {
	let databaseHealthIndicator: DatabaseHealthIndicator;
	let db: Database;

	beforeEach(async () => {
		// Create a mock for the Database
		db = {
			connection: jest.fn().mockReturnValue({
				execute: jest.fn().mockImplementation(async (cb) => cb()),
			}),
		} as unknown as Database;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DatabaseHealthIndicator,
				{
					provide: Database,
					useValue: db,
				},
			],
		}).compile();

		databaseHealthIndicator = module.get<DatabaseHealthIndicator>(
			DatabaseHealthIndicator,
		);
	});

	it('should be defined', () => {
		expect(databaseHealthIndicator).toBeDefined();
	});

	// eslint-disable-next-line jest/no-commented-out-tests
	// it('should return healthy status', async () => {
	// 	const result = {
	// 		version: 'PostgreSQL 12.3',
	// 	};

	// 	// Mock the database query to return a successful result
	// 	db.connection = jest.fn().mockReturnValue({
	// 		execute: jest.fn().mockResolvedValue({ rows: [result] }),
	// 	});

	// 	const healthResult = await databaseHealthIndicator.isHealthy('test-database');

	// 	expect(healthResult).toEqual({
	// 		'test-database': {
	// 			status: 'up',
	// 			message: 'Database is healthy',
	// 			version: 'PostgreSQL 12.3',
	// 		},
	// 	});
	// });

	it('should throw HealthCheckError when database is unhealthy', async () => {
		// Mock the database query to throw an error
		// db.connection = jest.fn().mockReturnValue({
		// 	execute: jest.fn().mockImplementation(async () => {
		// 		throw new Error('Database connection failed');
		// 	}),
		// });

		await expect(
			databaseHealthIndicator.isHealthy('test-database'),
		).rejects.toThrow(HealthCheckError);
	});
});
