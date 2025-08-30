export enum EUserType {
	ADMIN = 'admin',
	USER = 'user',
	SYSTEM = 'system',
}

export enum EAdminRoleType {
	SUPER_ADMIN = 'super_admin',
	OPERATOR = 'operator',
	GUEST = 'guest',
	DEVELOPER = 'developer',
}

export enum EGender {
	MALE = 'male',
	FEMALE = 'female',
	OTHER = 'other',
}

export enum ENationality {
	// AMERICAN = 'american', // United States
	// VIETNAMESE = 'vietnamese', // Vietnamese
	FILIPINOS = 'filipinos', // Philippine
	// KOREAN = 'korean', // South Korean
	// CHINESE = 'chinese', // Chinese
}

export enum ECacheTime {
	ONE_SECOND = 1000,
	FIVE_SECONDS = 5 * ECacheTime.ONE_SECOND,
	THIRTY_SECONDS = 30 * ECacheTime.ONE_SECOND,
	ONE_MINUTE = 60 * 1000,
	FIVE_MINUTES = 5 * 60 * 1000,
	TEN_MINUTES = 10 * 60 * 1000,
	FIFTEEN_MINUTES = 15 * 60 * 1000,
	THIRTY_MINUTES = 30 * 60 * 1000,
	ONE_HOUR = 60 * 60 * 1000,
	ONE_DAY = 24 * 60 * 60 * 1000,
}

export enum EQueueName {
	PROCESS_CW_TOKEN = 'cw-token-queue--process-cw-token',
	PROCESS_CW_NFT = 'cw-token-queue--process-cw-nft',
	NOTIFICATION_QUEUE = 'notification-queue',
}

export enum EQueueTokenJobName {
	PROCESS_CW_TOKEN_DEPOSIT = 'cw-token-queue--process-cw-token-deposit',
	PROCESS_CW_TOKEN_WITHDRAW_REQUEST = 'cw-token-queue--process-cw-token-withdraw-request',
	PROCESS_CW_TOKEN_WITHDRAW_CONFIRM = 'cw-token-queue--process-cw-token-withdraw-confirm',
}

export enum EQueueNFTJobName {
	PROCESS_CW_NFT_DEPOSIT = 'cw-nft-queue--process-cw-nft-deposit',
	PROCESS_CW_NFT_WITHDRAW = 'cw-nft-queue--process-cw-nft-withdraw',
}

export const PAGINATION_DEFAULT_PAGE = 1;
export const PAGINATION_DEFAULT_PAGE_SIZE = 10;

export enum EDashboardType {
	DAILY = 'daily',
	MONTHLY = 'monthly',
	YEARLY = 'yearly',
}

export const API_HEADERS = {
	ACCEPT_LANGUAGE_CODE: 'x-language-code',
	APP_VERSION: 'app-version',
	DEVICE_NAME: 'device-name',
};

export const MESSAGE_QUEUE_ATTEMPTS = 3;

export enum EAppCacheKey {
	RANKING_USER_CACHE_UPDATE_LOCK = 'ranking_user_cache_update_lock',
	RANKING_LAND_CACHE_UPDATE_LOCK = 'ranking_land_cache_update_lock',
	CHARACTER_ENERGY_RESET_LOCK = 'character_energy_reset_lock',
	CHARACTER_LIFETIME_CHECK_LOCK = 'character_lifetime_check_lock',
	GOLD_BAG_DISTRIBUTION_LOCK = 'gold_bag_distribution_lock',

	// ==============================================
	ADMIN_USER = 'admin-user',
	USER = 'user',
	TRANSFORMED_ROLE_PERMISSION = 'transformed-role-permission',
	SET_OF_ROLE_PERMISSION = 'set-of-role-permission',

	// ==============================================
	// GAME CONFIG CACHE KEYS
	// ==============================================
	CHARACTER_CONFIG = 'game_config:character_config',
	CHARACTER_REQUIRED_FOOD = 'game_config:character_required_food',
	CHARACTER_GENERATION = 'game_config:character_generation',
	CHARACTER_STATS_UPGRADE = 'game_config:character_stats_upgrade',
	MAP_PVE = 'game_config:map_pve',
	MAP_PVP = 'game_config:map_pvp',
	EGGS_SYSTEM = 'game_config:eggs_system',
	LAND_FARMING = 'game_config:land_farming',
	CHARACTER_SKILL_SLOT = 'game_config:character_skill_slot',
	CHEST_PACKAGE = 'game_config:chest_package',
	GOLD_BAG_GIFT = 'game_config:gold_bag_gift',
	SKILL_GENERATION = 'game_config:skill_generation',
	ITEM = 'game_config:item',
	MARKET_TRADE_CONFIG = 'game_config:market_trade_config',
}

export enum EGameConfigCategory {
	CHARACTER = 'character',
	MAP_PVE = 'map_pve',
	MAP_PVP = 'map_pvp',
	LAND_FARMING = 'land_farming',
	EGGS_SYSTEM = 'eggs_system',
	CHEST_PACKAGE = 'chest_package',
	SYSTEM = 'system',
}

export enum EGameConfigKey {
	CHARACTER_GENERATION = 'character_generation',
	CHARACTER_STATS_UPGRADE = 'character_stats_upgrade',
	MAP_PVE = 'map_pve',
	MAP_PVP = 'map_pvp',
	CHARACTER_CONFIG = 'character_config',
	CHARACTER_REQUIRED_FOOD = 'character_required_food',
	LAND_FARMING = 'land_farming',
	CHARACTER_SKILL_SLOT = 'character_skill_slot',
	CHEST_PACKAGE = 'chest_package',
	GOLD_BAG_GIFT = 'gold_bag_gift',
	EGG_SYSTEM_CONFIG = 'egg_system_config',
	SKILL_GENERATION = 'skill_generation',
	MARKET_TRADE_CONFIG = 'market_trade_config',
}

export interface IBattleResult {
	isWin: boolean;
	characterExp: number;
	userExp: number;
	currencyReward: number;
	droppedItems: Array<{
		itemId?: string;
		inventoryItemId?: string;
		itemCode: string;
		quantity: number;
	}>;
	energyCost: number;
	battleAt: Date;
	stats?: IBattleStats;
	turns?: IBattleTurnLog[];
}

export interface IBattleStats {
	totalDamageDealt: number;
	totalDamageTaken: number;
	maxDamageDealt: number;
	dodges: number;
	turns: number;
}

export interface IBattleTurnLog {
	turn: number;
	damageDealt: number;
	damageTaken: number;
	isDodged: boolean;
	isCritical: boolean;
}

// Virtual Tour Enums
export enum ETourStatus {
	DRAFT = 'DRAFT',
	PUBLISHED = 'PUBLISHED',
	ARCHIVED = 'ARCHIVED',
	UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum ETourDifficulty {
	BEGINNER = 'BEGINNER',
	INTERMEDIATE = 'INTERMEDIATE',
	ADVANCED = 'ADVANCED',
}

export enum EHotspotType {
	NAVIGATION = 'NAVIGATION',
	INFO = 'INFO',
	INTERACTIVE = 'INTERACTIVE',
}

export enum EMediaType {
	IMAGE = 'IMAGE',
	VIDEO = 'VIDEO',
	AUDIO = 'AUDIO',
	DOCUMENT = 'DOCUMENT',
	UNDEFINED = 'UNDEFINED',
}

export enum EMediaStatus {
	UPLOADING = 'UPLOADING',
	PROCESSING = 'PROCESSING',
	READY = 'READY',
	FAILED = 'FAILED',
	ARCHIVED = 'ARCHIVED',
}

// Add EAccountStatus if not already defined
export enum EAccountStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	SUSPENDED = 'SUSPENDED',
	PENDING_VERIFICATION = 'PENDING_VERIFICATION',
	DEACTIVATED = 'DEACTIVATED',
}
