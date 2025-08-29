/* eslint-disable @typescript-eslint/naming-convention */
import { Kysely, type Transaction } from 'kysely';

import {
	type CharacterPveProgressTable,
	type CharacterTable,
	type LandCropTable,
	type LandTable,
} from '../../core/entities';
import { type AdminTable } from '../../core/entities/admin.entity';
import { type CharacterSkillTable } from '../../core/entities/character-skill.entity';
import {
	type BattleActionTable,
	type BattleSessionTable,
	type FarmingHistoryTable,
	type GameConfigTable,
	type GameWalletTable,
	type GameWalletTransactionTable,
	type ItemTable,
	type WishlistItemTable,
} from '../../core/entities/game.index';
import { type MarketItemTransactionTable } from '../../core/entities/market-item-transaction.entity';
import { type MarketListingItemTable } from '../../core/entities/market-listing-item.entity';
import {
	type MarketplaceBidTable,
	type MarketplaceCategoryTable,
	type MarketplaceListingTable,
	type MarketplaceNftTable,
	type MarketplaceOfferTable,
	type MarketplacePriceHistoryTable,
	type MarketplaceReviewTable,
	type MarketplaceTransactionTable,
	type MarketplaceWatchlistTable,
} from '../../core/entities/marketplace.index';
import {
	type PermissionTable,
	type RolePermissionTable,
	type RoleTable,
	type UserRoleTable,
} from '../../core/entities/permission.entity';
import { type SkillTemplateTable } from '../../core/entities/skill-template.entity';
import { type UserInventoryTable } from '../../core/entities/user-inventory.entity';
import { type UserSkillTable } from '../../core/entities/user-skill.entity';
import { type UserTable } from '../../core/entities/user.entity';

export interface Tables {
	admins: AdminTable;
	users: UserTable;

	roles: RoleTable;
	permissions: PermissionTable;
	rolePermissions: RolePermissionTable;
	userRoles: UserRoleTable;

	// Marketplace
	listings: MarketplaceListingTable;
	nfts: MarketplaceNftTable;
	categories: MarketplaceCategoryTable;
	bids: MarketplaceBidTable;
	offers: MarketplaceOfferTable;
	transactions: MarketplaceTransactionTable;
	watchlists: MarketplaceWatchlistTable;
	reviews: MarketplaceReviewTable;
	priceHistories: MarketplacePriceHistoryTable;

	// Cwgame
	items: ItemTable;
	userInventories: UserInventoryTable;
	userLands: LandTable;
	landCrops: LandCropTable;
	farmingHistories: FarmingHistoryTable;
	characters: CharacterTable;
	characterPveProgress: CharacterPveProgressTable;
	characterInventories: UserInventoryTable;
	skillTemplates: SkillTemplateTable;
	characterSkills: CharacterSkillTable;
	wallets: GameWalletTable;
	walletTransactions: GameWalletTransactionTable;
	wishlistItems: WishlistItemTable;
	gameConfigs: GameConfigTable;
	battleSessions: BattleSessionTable;
	battleActions: BattleActionTable;
	userSkills: UserSkillTable;

	// Market Trading
	marketListingItems: MarketListingItemTable;
	marketItemTransactions: MarketItemTransactionTable;
}

export enum DbSchema {
	public = 'public',
	app = 'app',
	marketplace = 'marketplace',
}

export class Database extends Kysely<Tables> {}

export type DbTransaction = Transaction<Tables>;
