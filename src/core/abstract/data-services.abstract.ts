import { type ICharacterSkillRepository } from '../../infrastructure/repositories/character-skills.repository';
import { type ICharacterRepository } from '../../infrastructure/repositories/character.repository';
import { type IMarketListingItemRepository } from '../../infrastructure/repositories/market-listing-item.repository';
import { type ISkillTemplateRepository } from '../../infrastructure/repositories/skill-template.repository';
import { type IUserSkillRepository } from '../../infrastructure/repositories/user-skill.repository';
import { type IBattleActionRepository } from '../../modules/cwgame/battle/battle-action.repository';
import { type IBattleSessionRepository } from '../../modules/cwgame/battle/battle-session.repository';
import { type IInventoryRepository } from '../../modules/cwgame/cw-inventory.repository';
import { type IItemRepository } from '../../modules/cwgame/cw-items.repository';
import { type IWishlistRepository } from '../../modules/cwgame/cw-wishlist.repository';
import { type IGameConfigRepository } from '../../modules/cwgame/game-configs/game-config.repository';
import { type IGameWalletRepository } from '../../modules/cwgame/gamewallet.repository';
import {
	type IFarmingHistoryRepository,
	type ILandCropRepository,
	type ILandRepository,
} from '../../modules/cwgame/land-farming/land.repository';
import { type IRankingRepository } from '../../modules/cwgame/ranking/ranking.repository';
import { type INFTListingRepository } from '../../modules/marketplace/nfts/nfts.repository';
import { type IUserRepository } from '../../modules/user/user.repository';
import { type IAdminRepository } from '../domain/admin.repository.interface';
import { type ITransaction } from '../domain/transaction.interface';

// IDataServices should now expose IUsersRepository, which extends IGenericRepository
export abstract class IDataServices {
	abstract transaction: ITransaction;

	abstract admins: IAdminRepository;

	abstract users: IUserRepository;

	abstract characters: ICharacterRepository;

	abstract nftListings: INFTListingRepository;

	abstract wallets: IGameWalletRepository;

	abstract items: IItemRepository;

	abstract inventory: IInventoryRepository;

	abstract wishlist: IWishlistRepository;

	abstract gameConfig: IGameConfigRepository;

	abstract battleSessions: IBattleSessionRepository;

	abstract battleActions: IBattleActionRepository;

	abstract lands: ILandRepository;

	abstract landCrops: ILandCropRepository;

	abstract farmingHistory: IFarmingHistoryRepository;

	abstract characterSkills: ICharacterSkillRepository;

	abstract skillTemplates: ISkillTemplateRepository;

	abstract userSkills: IUserSkillRepository;

	abstract userRankings: IRankingRepository;

	abstract marketListingItems: IMarketListingItemRepository;
}
