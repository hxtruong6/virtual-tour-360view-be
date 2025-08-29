import { Injectable } from '@nestjs/common';
import {
	HealthCheckError,
	HealthIndicator,
	type HealthIndicatorResult,
} from '@nestjs/terminus';
import { sql } from 'kysely';

import { Database } from '../../../infrastructure/database/database';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
	constructor(private readonly db: Database) {
		super();
	}

	async isHealthy(eventName: string): Promise<HealthIndicatorResult> {
		try {
			const result = (await sql`SELECT version();`
				.execute(this.db)
				.then((res) => res.rows[0])) as {
				version: string;
			};

			// console.info('Database version:', result);

			return {
				[eventName]: {
					status: 'up',
					message: 'Database is healthy',
					version: result.version,
				},
			};
		} catch (error) {
			throw new HealthCheckError(`${eventName} failed`, {
				[eventName]: error,
			});
		}
	}
}
