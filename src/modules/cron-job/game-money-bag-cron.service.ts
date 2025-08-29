import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import {
	EAppCacheKey,
	ECacheTime,
	EGameConfigKey,
} from '../../common/constants';
import { CW_ITEM_CODE } from '../../common/constants/constant';
import { EEggType } from '../../common/constants/enums';
import { IConfigGoldBagGift } from '../../common/constants/game-config.type';
import { IDataServices } from '../../core/abstract';
import {
	ECharacterRarity,
	ECharacterStatus,
} from '../../core/entities/character.entity';
import { CacheService } from '../../shared/services/cache.service';

@Injectable()
export class GameMoneyBagCronService {
	private readonly logger = new Logger(GameMoneyBagCronService.name);

	constructor(
		private readonly dataServices: IDataServices,
		private readonly cacheService: CacheService,
	) {}

	/**
	 * Distribute Gold Bags to users daily at 07:00 Vietnam time
	 * Only Generation 1 (GEN1_EGG) characters can receive Gold Bags
	 */
	@Cron('0 7 * * *', {
		name: 'distribute-gold-bags',
		timeZone: 'Asia/Ho_Chi_Minh', // GMT+7
	})
	async distributeGoldBags(): Promise<void> {
		try {
			this.logger.log({
				message: 'Starting scheduled Gold Bag distribution...',
			});

			const isLocked = await this.cacheService.getLock(
				EAppCacheKey.GOLD_BAG_DISTRIBUTION_LOCK,
				300, // 5 minutes lock
			);

			if (!isLocked) {
				this.logger.log('Gold Bag distribution is locked, skipping...');

				return;
			}

			await this.executeGoldBagDistribution();

			await this.cacheService.releaseLock(
				EAppCacheKey.GOLD_BAG_DISTRIBUTION_LOCK,
			);
		} catch (error) {
			this.logger.error(
				'Failed to distribute Gold Bags in scheduled job',
				error,
			);

			// Release lock in case of error
			try {
				await this.cacheService.releaseLock(
					EAppCacheKey.GOLD_BAG_DISTRIBUTION_LOCK,
				);
			} catch (lockError) {
				this.logger.error('Failed to release lock after error', lockError);
			}
		}
	}

	/**
	 * Common method to execute Gold Bag distribution
	 * @returns Promise with distribution statistics
	 */
	private async executeGoldBagDistribution(): Promise<{
		usersProcessed: number;
		goldBagsDistributed: number;
		errorCount: number;
	}> {
		// Get Gold Bag Gift configuration
		const config = await this.getGoldBagGiftConfig();

		// Get all alive characters and filter for GEN1
		const gen1Characters = await this.dataServices.characters.get({
			filters: {
				status: ECharacterStatus.ALIVE,
				eggType: EEggType.GEN1,
			},
		});

		// Group characters by user
		const userCharacters = new Map<string, typeof gen1Characters>();

		for (const character of gen1Characters) {
			if (!userCharacters.has(character.userId)) {
				userCharacters.set(character.userId, []);
			}

			userCharacters.get(character.userId)!.push(character);
		}

		this.logger.log(
			`Found ${userCharacters.size} users with GEN1 characters for Gold Bag distribution`,
		);

		let usersProcessed = 0;
		let goldBagsDistributed = 0;
		let errorCount = 0;

		// Process users in batches to avoid memory issues
		const batchSize = 50;
		const userIds = [...userCharacters.keys()];

		for (let i = 0; i < userIds.length; i += batchSize) {
			const batch = userIds.slice(i, i + batchSize);

			const batchPromises = batch.map(async (userId) => {
				try {
					const userCharacterCount = userCharacters.get(userId)!.length;
					const totalGoldBags = this.calculateTotalGoldBags(
						userCharacters.get(userId)!,
						config,
					);

					if (totalGoldBags > 0) {
						// Add Gold Bags to user's inventory
						await this.dataServices.inventory.addItemToInventory({
							userId,
							itemCode: CW_ITEM_CODE.MONEY_BAG,
							quantity: totalGoldBags,
							metadata: {
								source: 'daily_gift',
								distributedAt: new Date().toISOString(),
								characterCount: userCharacterCount,
							},
						});

						goldBagsDistributed += totalGoldBags;

						this.logger.log(
							`Distributed ${totalGoldBags} Gold Bags to user ${userId} (${userCharacterCount} GEN1 characters)`,
						);
					}

					usersProcessed++;
				} catch (error) {
					this.logger.error(
						`Failed to distribute Gold Bags to user ${userId}`,
						error,
					);
					errorCount++;
				}
			});

			// eslint-disable-next-line no-await-in-loop
			await Promise.all(batchPromises);

			// Log progress for large datasets
			if (userIds.length > batchSize) {
				this.logger.log(
					`Processed ${Math.min(i + batchSize, userIds.length)}/${userIds.length} users`,
				);
			}
		}

		this.logger.log(
			`Gold Bag distribution completed. Users: ${usersProcessed}, Gold Bags: ${goldBagsDistributed}, Errors: ${errorCount}`,
		);

		return {
			usersProcessed,
			goldBagsDistributed,
			errorCount,
		};
	}

	/**
	 * Get Gold Bag Gift configuration with caching
	 */
	private async getGoldBagGiftConfig(): Promise<IConfigGoldBagGift> {
		// Try to get from cache first
		const cachedConfig = await this.cacheService.get(
			EAppCacheKey.GOLD_BAG_GIFT,
		);

		if (cachedConfig) {
			return cachedConfig as IConfigGoldBagGift;
		}

		// Get from database
		const config = await this.dataServices.gameConfig.getConfigByKey(
			EGameConfigKey.GOLD_BAG_GIFT,
		);

		const goldBagConfig = config.configValue as unknown as IConfigGoldBagGift;

		// Cache the result for 1 day
		await this.cacheService.set(
			EAppCacheKey.GOLD_BAG_GIFT,
			goldBagConfig,
			ECacheTime.ONE_DAY,
		);

		return goldBagConfig;
	}

	/**
	 * Calculate total Gold Bags for a user based on their characters
	 */
	private calculateTotalGoldBags(
		characters: Array<{ rarity: ECharacterRarity }>,
		config: IConfigGoldBagGift,
	): number {
		let totalGoldBags = 0;

		for (const character of characters) {
			const matchingRarityConfig = config.characterRarityConfigs.find(
				(rarityConfig) => rarityConfig.rarity === character.rarity,
			);

			if (matchingRarityConfig) {
				totalGoldBags += matchingRarityConfig.quantity;
			}
		}

		return totalGoldBags;
	}

	/**
	 * Manual trigger to distribute Gold Bags
	 * Can be called via admin endpoint or for testing
	 */
	async manualDistributeGoldBags(): Promise<{
		usersProcessed: number;
		goldBagsDistributed: number;
		errorCount: number;
	}> {
		return this.executeGoldBagDistribution();
	}
}
