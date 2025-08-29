import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { EAppCacheKey } from '../../common/constants';
import { IDataServices } from '../../core/abstract';
import { ECharacterStatus } from '../../core/entities/character.entity';
import { CacheService } from '../../shared/services/cache.service';

@Injectable()
export class CharacterEnergyCronService {
	private readonly logger = new Logger(CharacterEnergyCronService.name);

	constructor(
		private readonly dataServices: IDataServices,
		private readonly cacheService: CacheService,
	) {}

	/**
	 * Reset character energy daily at 0 GMT+7
	 * This runs every day at 0:00 GMT+7 (midnight Vietnam time)
	 */
	@Cron('0 0 * * *', {
		name: 'reset-character-energy',
		timeZone: 'Asia/Ho_Chi_Minh', // GMT+7
	})
	async resetCharacterEnergy(): Promise<void> {
		try {
			this.logger.log({
				message: 'Starting scheduled character energy reset...',
			});

			const isLocked = await this.cacheService.getLock(
				EAppCacheKey.CHARACTER_ENERGY_RESET_LOCK,
				300, // 5 minutes lock
			);

			if (!isLocked) {
				this.logger.log('Character energy reset is locked, skipping...');

				return;
			}

			await this.executeEnergyReset();

			await this.cacheService.releaseLock(
				EAppCacheKey.CHARACTER_ENERGY_RESET_LOCK,
			);
		} catch (error) {
			this.logger.error(
				'Failed to reset character energy in scheduled job',
				error,
			);

			// Release lock in case of error
			try {
				await this.cacheService.releaseLock(
					EAppCacheKey.CHARACTER_ENERGY_RESET_LOCK,
				);
			} catch (lockError) {
				this.logger.error('Failed to release lock after error', lockError);
			}
		}
	}

	/**
	 * Common method to execute character energy reset
	 * @returns Promise with reset statistics
	 */
	private async executeEnergyReset(): Promise<{
		resetCount: number;
		errorCount: number;
	}> {
		// Get all characters that need energy reset
		const characters = await this.dataServices.characters.get({
			filters: { status: ECharacterStatus.ALIVE },
		});

		if (characters.length === 0) {
			this.logger.log('No characters found for energy reset');

			return {
				resetCount: 0,
				errorCount: 0,
			};
		}

		let resetCount = 0;
		let errorCount = 0;

		// Process characters in batches to avoid memory issues
		const batchSize = 100;

		for (let i = 0; i < characters.length; i += batchSize) {
			const batch = characters.slice(i, i + batchSize);

			const batchPromises = batch.map(async (character) => {
				try {
					// Reset usedEnergyInDay to 0
					await this.dataServices.characters.update(character.id, {
						usedEnergyInDay: 0,
					});

					resetCount++;
				} catch (error) {
					this.logger.error(
						`Failed to reset energy for character ${character.id}`,
						error,
					);
					errorCount++;
				}
			});

			// eslint-disable-next-line no-await-in-loop
			await Promise.all(batchPromises);

			// Log progress for large datasets
			if (characters.length > batchSize) {
				this.logger.log(
					`Processed ${Math.min(i + batchSize, characters.length)}/${characters.length} characters`,
				);
			}
		}

		this.logger.log(
			`Character energy reset completed. Reset: ${resetCount}, Errors: ${errorCount}`,
		);

		return {
			resetCount,
			errorCount,
		};
	}
}
