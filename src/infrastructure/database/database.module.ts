/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Global, Module } from '@nestjs/common';
import {
	CamelCasePlugin,
	ParseJSONResultsPlugin,
	PostgresDialect,
} from 'kysely';
import { Pool, types } from 'pg';

import { Database } from './database';
import { type IDatabaseOptions } from './database-option';
import {
	ConfigurableDatabaseModule,
	DATABASE_OPTIONS,
} from './database.module-definition';

@Global()
@Module({
	exports: [Database],
	providers: [
		{
			provide: Database,
			inject: [DATABASE_OPTIONS],
			useFactory: (databaseOptions: IDatabaseOptions) => {
				const dialect = new PostgresDialect({
					pool: new Pool({
						host: databaseOptions.host,
						port: databaseOptions.port,
						user: databaseOptions.username,
						password: databaseOptions.password,
						database: databaseOptions.database,
					}),
				});

				// convert all numeric to number
				// eslint-disable-next-line unicorn/prefer-native-coercion-functions
				types.setTypeParser(types.builtins.NUMERIC, (value: string) =>
					Number(value),
				);

				return new Database({
					dialect,
					plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
				});
			},
		},
	],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
