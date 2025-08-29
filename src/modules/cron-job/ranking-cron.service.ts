import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { EAppCacheKey, ECacheTime } from '../../common/constants';
import { CacheService } from '../../shared/services/cache.service';
import { RankingCacheService } from '../cwgame/ranking/ranking-cache.service';

@Injectable()
export class RankingCronService {
	private readonly logger = new Logger(RankingCronService.name);

	constructor(
		private readonly rankingCacheService: RankingCacheService,
		private readonly cacheService: CacheService,
	) {}

	/**
	 * Update ranking cache every 5 minutes
	 * This runs in a separate process to avoid blocking the main server
	 */
	@Cron(CronExpression.EVERY_10_MINUTES)
	async updateRankingCache(): Promise<void> {
		try {
			this.logger.log('Starting scheduled ranking cache update...');

			// if last cache under 5 minutes, skip
			const lastCache = await this.rankingCacheService.getCachedUserRankings();

			if (
				lastCache?.lastUpdated &&
				new Date(lastCache.lastUpdated).getTime() >
					Date.now() - ECacheTime.TEN_MINUTES
			) {
				this.logger.log(
					'Skipping ranking cache update - last cache is under 5 minutes',
				);

				return;
			}

			const isLocked = await this.cacheService.getLock(
				EAppCacheKey.RANKING_USER_CACHE_UPDATE_LOCK,
				60,
			);

			if (!isLocked) {
				this.logger.log('Ranking cache update is locked, skipping...');

				return;
			}

			await this.rankingCacheService.cacheAllUserRankings();

			await this.cacheService.releaseLock(
				EAppCacheKey.RANKING_USER_CACHE_UPDATE_LOCK,
			);

			this.logger.log('Scheduled ranking cache update completed successfully');
		} catch (error) {
			this.logger.error(
				'Failed to update ranking cache in scheduled job',
				error,
			);
		}
	}

	/**
	 * Manual trigger to update ranking cache
	 * Can be called via admin endpoint or for testing
	 */
	async manualUpdateRankingCache(): Promise<void> {
		try {
			this.logger.log('Starting manual ranking cache update...');

			await this.rankingCacheService.cacheAllUserRankings();

			this.logger.log('Manual ranking cache update completed successfully');
		} catch (error) {
			this.logger.error('Failed to update ranking cache manually', error);

			throw error;
		}
	}

	/**
	 * Invalidate ranking cache
	 * Can be called when data changes significantly
	 */
	async invalidateRankingCache(): Promise<void> {
		try {
			this.logger.log('Invalidating ranking cache...');

			await this.rankingCacheService.invalidateAllRankingCaches();

			this.logger.log('Ranking cache invalidated successfully');
		} catch (error) {
			this.logger.error('Failed to invalidate ranking cache', error);

			throw error;
		}
	}

	/**
	 * Update land ranking cache every 5 minutes
	 * This runs in a separate process to avoid blocking the main server
	 */
	@Cron(CronExpression.EVERY_10_MINUTES)
	async updateLandRankingCache(): Promise<void> {
		try {
			this.logger.log('Updating land ranking cache...');

			// if last cache under 5 minutes, skip
			const lastCache = await this.rankingCacheService.getCachedLandRankings();

			if (
				lastCache?.lastUpdated &&
				new Date(lastCache.lastUpdated).getTime() >
					Date.now() - ECacheTime.TEN_MINUTES
			) {
				this.logger.log(
					'Skipping land ranking cache update - last cache is under 5 minutes',
				);

				return;
			}

			const isLocked = await this.cacheService.getLock(
				EAppCacheKey.RANKING_LAND_CACHE_UPDATE_LOCK,
				60,
			);

			if (!isLocked) {
				this.logger.log('Land ranking cache update is locked, skipping...');

				return;
			}

			await this.rankingCacheService.cacheAllLandRankings();

			await this.cacheService.releaseLock(
				EAppCacheKey.RANKING_LAND_CACHE_UPDATE_LOCK,
			);

			this.logger.log('Land ranking cache updated successfully');
		} catch (error) {
			this.logger.error('Failed to update land ranking cache', error);
		}
	}
}
