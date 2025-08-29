/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import {
	FileMigrationProvider,
	Kysely,
	Migrator,
	PostgresDialect,
} from 'kysely';
import { promises as fs } from 'node:fs';
// eslint-disable-next-line unicorn/import-style
import * as path from 'node:path';
import { Pool } from 'pg';

import '../../boilerplate.polyfill';
import { getEnvFilePath } from '../../common/utils';

config({ path: getEnvFilePath() });

const configService = new ConfigService();

async function migrateToLatest() {
	console.info('◐ Starting migration...');
	// console.info('Config DB_HOST:', configService.get('DB_HOST'));
	// console.info('Config DB_PORT:', configService.get('DB_PORT'));
	// console.info('Config DB_USERNAME:', configService.get('DB_USERNAME'));
	// console.info('Config DB_PASSWORD:', configService.get('DB_PASSWORD'));
	// console.info('Config DB_DATABASE:', configService.get('DB_DATABASE'));

	const database = new Kysely({
		dialect: new PostgresDialect({
			pool: new Pool({
				host: configService.get('DB_HOST'),
				port: configService.get('DB_PORT'),
				user: configService.get('DB_USERNAME'),
				password: configService.get('DB_PASSWORD'),
				database: configService.get('DB_DATABASE'),
			}),
		}),
	});
	// print migration folder

	console.info('Migration folder:', path.join(__dirname, 'migrations'));

	const migrator = new Migrator({
		db: database,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(__dirname, 'migrations'),
		}),
	});

	const { error, results } = await migrator.migrateToLatest();

	console.info('ℹ Migration results:', results);

	if (results) {
		for (const migrationResult of results) {
			if (migrationResult.status === 'Success') {
				console.info(
					`migration "${migrationResult.migrationName}" was executed successfully`,
				);
			} else if (migrationResult.status === 'Error') {
				console.error(
					`failed to execute migration "${migrationResult.migrationName}"`,
				);
			}
		}
	}

	if (error) {
		console.error('Failed to migrate');
		console.error(error);
		// process.exit(1);
	}

	await database.destroy();
	console.info('✔ Migration completed');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
(async () => {
	await migrateToLatest();
})();
