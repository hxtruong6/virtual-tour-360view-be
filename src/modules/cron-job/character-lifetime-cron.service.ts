import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { EAppCacheKey } from '../../common/constants';
import { IDataServices } from '../../core/abstract';
import { ECharacterStatus } from '../../core/entities/character.entity';
import { CacheService } from '../../shared/services/cache.service';

@Injectable()
export class CharacterLifetimeCronService {
	private readonly logger = new Logger(CharacterLifetimeCronService.name);

	constructor(
		private readonly dataServices: IDataServices,
		private readonly cacheService: CacheService,
	) {}

	/**
	 * Check character lifetimes and set status to dead when expired
	 * This runs every hour to check for characters that have reached their endLifetime
	 */
	@Cron('0 * * * *', {
		name: 'check-character-lifetime',
		timeZone: 'Asia/Ho_Chi_Minh', // GMT+7
	})
	async checkCharacterLifetime(): Promise<void> {
		try {
			this.logger.log({
				message: 'Starting scheduled character lifetime check...',
			});

			const isLocked = await this.cacheService.getLock(
				EAppCacheKey.CHARACTER_LIFETIME_CHECK_LOCK,
				300, // 5 minutes lock
			);

			if (!isLocked) {
				this.logger.log('Character lifetime check is locked, skipping...');

				return;
			}

			await this.executeLifetimeCheck();

			await this.cacheService.releaseLock(
				EAppCacheKey.CHARACTER_LIFETIME_CHECK_LOCK,
			);
		} catch (error) {
			this.logger.error(
				'Failed to check character lifetime in scheduled job',
				error,
			);

			// Release lock in case of error
			try {
				await this.cacheService.releaseLock(
					EAppCacheKey.CHARACTER_LIFETIME_CHECK_LOCK,
				);
			} catch (lockError) {
				this.logger.error('Failed to release lock after error', lockError);
			}
		}
	}

	/**
	 * Common method to execute character lifetime check
	 * @returns Promise with check statistics
	 */
	private async executeLifetimeCheck(): Promise<{
		deadCount: number;
		errorCount: number;
	}> {
		const currentDate = new Date();

		// Get all characters and filter for those that are alive and have reached their endLifetime
		const allCharacters = await this.dataServices.characters.get({
			filters: { status: ECharacterStatus.ALIVE },
		});

		const characters = allCharacters.filter((character) => {
			return (
				character.status === ECharacterStatus.ALIVE &&
				character.endLifetime &&
				character.endLifetime <= currentDate
			);
		});

		if (characters.length === 0) {
			this.logger.log('No characters found for lifetime check');

			return {
				deadCount: 0,
				errorCount: 0,
			};
		}

		this.logger.log(
			`Found ${characters.length} characters that have reached their endLifetime`,
		);

		let deadCount = 0;
		let errorCount = 0;

		// Process characters in batches to avoid memory issues
		const batchSize = 100;

		for (let i = 0; i < characters.length; i += batchSize) {
			const batch = characters.slice(i, i + batchSize);

			const batchPromises = batch.map(async (character) => {
				try {
					// Update character status to dead and set isAlive to false
					await this.dataServices.characters.update(character.id, {
						status: ECharacterStatus.DEAD,
					});

					this.logger.log(
						`Character ${character.id} (${character.characterName}) has died. EndLifetime: ${character.endLifetime}`,
					);

					deadCount++;
				} catch (error) {
					this.logger.error(
						`Failed to update character ${character.id} status to dead`,
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
			`Character lifetime check completed. Dead: ${deadCount}, Errors: ${errorCount}`,
		);

		return {
			deadCount,
			errorCount,
		};
	}
}
