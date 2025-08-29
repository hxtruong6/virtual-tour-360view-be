import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { PostgresDialect } from 'kysely';
import { defineConfig, getKnexTimestampPrefix } from 'kysely-ctl';
import { Pool } from 'pg';

import { getEnvFilePath } from '../src/common/utils';

config({ path: getEnvFilePath() });

const configService = new ConfigService();

console.info({
	DB_HOST: configService.get('DB_HOST'),
	DB_PORT: configService.get('DB_PORT'),
	DB_USERNAME: configService.get('DB_USERNAME'),
	DB_PASSWORD: configService.get('DB_PASSWORD'),
	DB_DATABASE: configService.get('DB_DATABASE'),
});

export default defineConfig({
	// replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
	dialect: new PostgresDialect({
		pool: new Pool({
			host: configService.get('DB_HOST'),
			port: configService.get('DB_PORT'),
			user: configService.get('DB_USERNAME'),
			password: configService.get('DB_PASSWORD'),
			database: configService.get('DB_DATABASE'),
		}),
	}),

	migrations: {
		getMigrationPrefix: getKnexTimestampPrefix,
		migrationFolder: 'src/infrastructure/database/migrations',
	},
	//   plugins: [],
	//   seeds: {
	//     seedFolder: "seeds",
	//   }
});
