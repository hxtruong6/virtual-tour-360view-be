import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Transaction } from 'kysely';

import { IDataServices } from '../../core/abstract';
import { IAdminRepository } from '../../core/domain/admin.repository.interface';
import { ITransaction } from '../../core/domain/transaction.interface';
import { Database, Tables } from '../../infrastructure/database/database';
import {
	BattleActionRepository,
	IBattleActionRepository,
} from '../../modules/cwgame/battle/battle-action.repository';
import {
	BattleSessionRepository,
	IBattleSessionRepository,
} from '../../modules/cwgame/battle/battle-session.repository';
import {
	CwInventoryRepository,
	IInventoryRepository,
} from '../../modules/cwgame/cw-inventory.repository';
import {
	CwItemRepository,
	IItemRepository,
} from '../../modules/cwgame/cw-items.repository';
import {
	CwWishlistRepository,
	IWishlistRepository,
} from '../../modules/cwgame/cw-wishlist.repository';
import {
	GameConfigRepository,
	IGameConfigRepository,
} from '../../modules/cwgame/game-configs/game-config.repository';
import {
	GameWalletRepository,
	IGameWalletRepository,
} from '../../modules/cwgame/gamewallet.repository';
import {
	FarmingHistoryRepository,
	IFarmingHistoryRepository,
	ILandCropRepository,
	ILandRepository,
	LandCropRepository,
	LandRepository,
} from '../../modules/cwgame/land-farming/land.repository';
import {
	IRankingRepository,
	RankingRepository,
} from '../../modules/cwgame/ranking/ranking.repository';
import {
	INFTListingRepository,
	NftListingRepository,
} from '../../modules/marketplace/nfts/nfts.repository';
import {
	IUserRepository,
	UserRepository,
} from '../../modules/user/user.repository';
import { AdminRepository } from '../repositories/admin.repository';
import {
	CharacterSkillRepository,
	ICharacterSkillRepository,
} from '../repositories/character-skills.repository';
import {
	CharacterRepository,
	ICharacterRepository,
} from '../repositories/character.repository';
import {
	IMarketListingItemRepository,
	MarketListingItemRepository,
} from '../repositories/market-listing-item.repository';
import {
	ISkillTemplateRepository,
	SkillTemplateRepository,
} from '../repositories/skill-template.repository';
import {
	IUserSkillRepository,
	UserSkillRepository,
} from '../repositories/user-skill.repository';

@Injectable()
export class KyselyDataServices
	implements IDataServices, OnApplicationBootstrap
{
	transaction!: ITransaction;

	admins!: IAdminRepository;

	users!: IUserRepository;

	characters!: ICharacterRepository;

	nftListings!: INFTListingRepository;

	wallets!: IGameWalletRepository;

	items!: IItemRepository;

	inventory!: IInventoryRepository;

	wishlist!: IWishlistRepository;

	gameConfig!: IGameConfigRepository;

	battleSessions!: IBattleSessionRepository;

	battleActions!: IBattleActionRepository;

	lands!: ILandRepository;

	landCrops!: ILandCropRepository;

	farmingHistory!: IFarmingHistoryRepository;

	characterSkills!: ICharacterSkillRepository;

	skillTemplates!: ISkillTemplateRepository;

	userSkills!: IUserSkillRepository;

	userRankings!: IRankingRepository;

	marketListingItems!: IMarketListingItemRepository;

	// Database here is postgresql with kysely. It could be any other database with any other ORM/query builder
	constructor(private readonly db: Database) {}

	onApplicationBootstrap() {
		this.transaction = {
			execute: async <T>(
				callback: (trx: Transaction<Tables>) => Promise<T>,
			) => {
				return this.db.transaction().execute((trx) => {
					return callback(trx);
				});
			},
		};

		this.admins = new AdminRepository(this.db);
		this.characters = new CharacterRepository(this.db);
		this.users = new UserRepository(this.db);
		this.nftListings = new NftListingRepository(this.db);
		this.wallets = new GameWalletRepository(this.db);
		this.items = new CwItemRepository(this.db); // game item in shop (character, land, potion, etc)
		this.inventory = new CwInventoryRepository(this.db); // user inventory items
		this.wishlist = new CwWishlistRepository(this.db); // user wishlist items
		this.gameConfig = new GameConfigRepository(this.db);
		this.battleSessions = new BattleSessionRepository(this.db);
		this.battleActions = new BattleActionRepository(this.db);
		this.lands = new LandRepository(this.db);
		this.landCrops = new LandCropRepository(this.db);
		this.farmingHistory = new FarmingHistoryRepository(this.db);
		this.characterSkills = new CharacterSkillRepository(this.db);
		this.skillTemplates = new SkillTemplateRepository(this.db);
		this.userSkills = new UserSkillRepository(this.db);
		this.userRankings = new RankingRepository(this.db);
		this.marketListingItems = new MarketListingItemRepository(this.db);
	}
}
