import { Controller, Get } from '@nestjs/common';
import {
	HealthCheck,
	type HealthCheckResult,
	HealthCheckService,
	// TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { ETranslateKey } from '../../common/constants/enums';
import { TranslationService } from '../../shared/services/translation.service';

// import { ServiceHealthIndicator } from './health-indicators/service.indicator';

@Controller('health')
export class HealthCheckerController {
	constructor(
		private healthCheckService: HealthCheckService,
		// private ormIndicator: TypeOrmHealthIndicator,
		// private serviceIndicator: ServiceHealthIndicator,
		// private databaseHealthIndicator: DatabaseHealthIndicator,
		private translationService: TranslationService,
	) {}

	@Get()
	@HealthCheck()
	async check(): Promise<HealthCheckResult> {
		return this.healthCheckService.check([
			// () => this.ormIndicator.pingCheck('database', { timeout: 1500 }),
			// () => this.serviceIndicator.isHealthy('search-service-health'),
			// () => this.databaseHealthIndicator.isHealthy('kysely-pg-database'),
		]);
	}

	@Get('welcome')
	test() {
		return {
			message1: {
				translateKey: ETranslateKey.ADMIN_WELCOME,
				args: { name: 'Aidan Bro :D', time: new Date().toLocaleTimeString() },
			},
			message2: {
				translateKey: 'unknown.key',
				args: { value1: 'unknown value' },
			},
			message3: {
				year: new Date().getFullYear(),
				month: new Date().getMonth(),
				day: new Date().getDate(),
				message4: {
					translateKey: ETranslateKey.ADMIN_WELCOME,
					args: { name: '…', time: new Date().toLocaleTimeString() },
				},
			},
		};
	}
}
