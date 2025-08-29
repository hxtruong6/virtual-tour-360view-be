import { Inject, Injectable } from '@nestjs/common';
import { Keyv } from 'keyv';

import { ECacheTime } from '../../common/constants';
import { ApiConfigService } from './api-config.service';

@Injectable()
export class CacheService {
	private prefix = '';

	constructor(
		@Inject('KEYV_INSTANCE') private readonly keyv: Keyv,
		private readonly configService: ApiConfigService,
	) {
		// if (this.configService.isDevelopment) {
		// 	this.prefix = 'dev:';
		// } else if (this.configService.isProduction) {
		// 	this.prefix = 'prod:';
		// } else if (this.configService.isTest) {
		// 	this.prefix = 'test:';
		// }
	}

	async get(key: string): Promise<unknown> {
		// eslint-disable-next-line no-return-await
		return (await this.keyv.get(`${this.prefix}${key}`)) as unknown;
	}

	async set(
		key: string,
		value: unknown,
		ttl: number = ECacheTime.ONE_DAY,
	): Promise<void> {
		await this.keyv.set(`${this.prefix}${key}`, value, ttl);
	}

	async delete(key: string): Promise<void> {
		await this.keyv.delete(`${this.prefix}${key}`);
	}

	async deleteMany(keys: string[]): Promise<void> {
		await this.keyv.deleteMany(keys.map((key) => `${this.prefix}${key}`));
	}

	async clear(): Promise<void> {
		await this.keyv.clear();
	}

	async getLock(key: string, ttl = 60): Promise<boolean> {
		const isLocked = (await this.keyv.get(`${this.prefix}${key}`)) as boolean;

		if (isLocked) {
			return false;
		}

		await this.keyv.set(`${this.prefix}${key}`, true, ttl);

		return true;
	}

	async releaseLock(key: string): Promise<void> {
		await this.keyv.delete(`${this.prefix}${key}`);
	}
}
