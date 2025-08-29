import { type ECharacterRarity } from '../../core/entities';
import { type EGameCurrencyType } from '../../core/entities/game-wallet.entity';
import { EItemRarity } from '../../core/entities/item.entity';
import { type EChestType, type ESkillAttributeRate } from './enums';

export interface IItemRef {
	itemId?: string; // item id provided in runtime
	inventoryItemId?: string; // inventory item id provided in runtime
	itemCode: string; // item code
	quantity: number; // quantity of item
	probability?: number; // probability of dropping or reward
	quantityMin?: number; // min quantity of item
	quantityMax?: number; // max quantity of item
}

export interface ICharacterStatsUpgradeConfig {
	level: number;
	requiredItems: IItemRef[];
	successProbability: number; // success probability of upgrade (0-100)
	successStatPoints: number; // stats points of upgrade when success
}

export interface IGameConfigCharacterGenerationConfig {
	characterStatRanges: {
		strength: { min: number; max: number };
		defense: { min: number; max: number };
		speed: { min: number; max: number };
		hp: { min: number; max: number };
	};
	characterLifetimeRangesInHours: {
		min: number;
		max: number;
	};
	characterDropRates: {
		gen1: Record<string, number>;
		gen2: Record<string, number>;
	};
}

export interface IGameConfigCharacterStatsUpgradeConfig {
	characterStatsUpgrades: {
		strength: ICharacterStatsUpgradeConfig;
		speed: ICharacterStatsUpgradeConfig;
		defense: ICharacterStatsUpgradeConfig;
	};
}

export interface IGameConfigMapPvELevelConfig {
	level: number; // Level of the map
	energyLose: number; // Energy lose for this level
	characterLevel: {
		// character level requirements to reach this level
		minLevel: number; // Minimum character level to reach this level
		maxLevel: number; // Maximum character level to reach this level
	};
	receiveExp: {
		// Experience received from battle if win, if lose, get 0 exp
		characterMinExp: number; // Minimum character experience received from battle if win, if lose, get 0 exp
		characterMaxExp: number; // Maximum character experience received from battle if win, if lose, get 0 exp
		userMinExp: number; // Minimum for user to receive experience received from battle if win, if lose, get 0 exp
		userMaxExp: number; // Maximum for user to receive experience received from battle if win, if lose, get 0 exp
	};
	reward: {
		currency: EGameCurrencyType; // Currency type
		amount: number; // Amount of currency
	};
	probabilityWin: number; // Probability of winning the battle
	// list items could drop
	dropItems: Array<{
		itemCode: string; // Item code
		quantity: number; // Quantity of item
		probability: number; // Probability of dropping
		quantityMin?: number; // min quantity of item
		quantityMax?: number; // max quantity of item
	}>;
}

export interface IGameConfigMapPvE {
	totalLevel: number; // Total level of the map
	// config requirements, reward and experience for each level
	levelConfigs: IGameConfigMapPvELevelConfig[];
}

export interface IGameConfigCharacterUpgradeLevelConfig {
	level: number;
	upgradeExp: number; // exp to upgrade to next level 10, 10+10, 10+10+10, ...
	requiredItemsToUpgrade: Array<{
		itemCode: string; // YELLOW_STONE
		quantity: number; // 9+3, 9+3+3, 9+3+3+3, ...
	}>;
	coinUpgradeFee: number; // fee to upgrade to next level (coin) 20, 20+20, 20+20+20, ...
}

export interface IGameConfigCharacterConfig {
	energyMaxPerDay: number; // The max energy of the character, default is 10
	maxLevel: number; // The max level of the character  (100)
	levelConfigs: IGameConfigCharacterUpgradeLevelConfig[];
}

export interface IGameConfigCharacterRequiredFood {
	gen1Egg: {
		requiredFood: number; // number of food required to regen energy (magic grass)
		receivedEnergy: number; // number of energy received per day
	};
	gen2Egg: {
		requiredFood: number; // number of food required to regen energy (magic grass)
		receivedEnergy: number; // number of energy received per day
	};
}

// for whole land
export interface IGameConfigLandFarming {
	seasonConfig: {
		spring: {
			startMonth: number;
			endMonth: number;
			seasonBoostPercentage: number;
		};
		summer: {
			startMonth: number;
			endMonth: number;
			seasonBoostPercentage: number;
		};
		autumn: {
			startMonth: number;
			endMonth: number;
			seasonBoostPercentage: number;
		};
		winter: {
			startMonth: number;
			endMonth: number;
			seasonBoostPercentage: number;
		};
	};
	levelConfigs: Array<{
		level: number;
		reduceHarvestTime: number; // reduce harvest time in seconds
		upgradeExp: number; // exp to upgrade to next level
		coinUpgradeFee: number; // fee to upgrade to next level (coin)
		numberOfSeedPerCrop: number; // number of seed per crop
		requiredItemsToUpgrade: Array<{
			itemCode: string; // item code
			quantity: number; // quantity of item
		}>;
		dropItems: Array<{
			itemId?: string; // item id provided in runtime
			inventoryItemId?: string; // inventory item id provided in runtime
			itemCode: string; // item code
			quantity: number; // quantity of item
			probability: number; // probability of dropping
			quantityMin?: number; // min quantity of item
			quantityMax?: number; // max quantity of item
		}>;
		rewardExp: number; // reward exp for each crop
		expGainWhenInteract: number; // exp gain when interact with the land (water/fertilize)
	}>;
	breakpointLevelConfig: {
		coinUpgradeFee: number;
		requiredItemsToUpgrade: Array<{
			itemCode: string;
			quantity: number;
		}>;
	};
	levelToUnlock16Crop: number; // level to unlock 16 crop (16 crop is max crop can be planted in a land) - after level 5
	waterPercentage: number; // water percentage need to water the land
	fertilizerPercentage: number; // fertilizer percentage need to fertilize the land

	maxDailyVisitAttemptsPerUser: number; // max daily visit attempts per user. i.e. 5 -> that user could visit 5 times in all lands
	// number of grass is stolen by other daily
	maxDailyAllowedStolenGrassAmountPerLand: number;
	// number of grass a land could steal other
	maxDailyGrassAmountStealOtherPerLand: number;
	// helper bonus
	helperConfig: {
		expAmount: number; // exp amount when user help to water/fertilize the land
		rewardItems: IItemRef[]; // reward items when user help to water/fertilize the land (only magic grass with probability 20%)
	};
	stealConfig: {
		expGainWhenSteal: number; // exp gain when land is stolen
		rewardItems: IItemRef[]; // reward items when land is stolen (only magic grass with probability 20%)
	};
}

// config for each seed
export interface IItemMetadataConfig {
	itemNameVi?: string;
	descriptionVi?: string;
	harvestDurationInSeconds?: number; // harvest time in seconds
	tags?: string[];
	iconUrl?: string;
	harvestTimeAt?: string; // harvest time in ISO string
}

// Character skill slot configuration
export interface ICharacterSkillSlotConfig {
	slotNumber: number; // Slot number (0-7) 0 is the first slot
	levelRequired: number; // Character level required to unlock
	requiredItems: IItemRef[]; // Items required to unlock
	coinUnlockFee: number; // Coin fee to unlock
}

export interface IGameConfigCharacterSkillSlots {
	totalSlots: number; // Total number of skill slots (8)
	slotConfigs: ICharacterSkillSlotConfig[];
}

export interface IChestItemConfig {
	id: string; // id of chest
	chestType: EChestType; // type of chest
	name: string;
	description: string;
	iconUrl?: string;
	requiredItems: IItemRef[]; // items required to open chest
	rewardItems: IItemRef[]; // items reward when open chest
	rewardCharacters: Array<{
		// only eggType gen2 can be rewarded
		characterRarity: ECharacterRarity; // character rarity
		quantity: number; // quantity of character
		probability: number; // probability of reward character
	}>;
	rewardCurrencies: Array<{
		currencyType: EGameCurrencyType; // currency type
		amount: number; // amount of currency
		probability: number; // probability of reward currency
	}>;
	maxOpenCountInTotal: number; // max open count of chest in total
	maxOpenCountPerDay: number; // max open count of chest per day
	maxOpenCountPerUser: number; // max open count of chest per user
	price?: number; // fee to open chest (coin)
	currencyType: EGameCurrencyType; // currency type of fee to open chest
	discountAmount?: number; // discount amount of fee to open chest
	discountPercentage?: number; // discount percentage of fee to open chest
	startDiscountAt?: string; // start discount at (ISO string)
	endDiscountAt?: string; // end discount at (ISO string)
	isActive: boolean; // is active
	metadata?: Record<string, unknown>; // metadata of chest
	updatedAt: string;
	updatedBy: string;
}

export interface IConfigGoldBagGift {
	characterRarityConfigs: Array<{
		rarity: ECharacterRarity;
		quantity: number; // quantity of gold bag
		currencyType: EGameCurrencyType; // currency type of gold bag
	}>;
	dropRates: Array<{
		probability: number; // probability of dropping
		minAmount: number;
		maxAmount: number; // max amount of gold bag
	}>;
}

// ============================================================================
// EGG SYSTEM CONFIGURATION
// ============================================================================

export interface IEggSystemConfig {
	// GEN1 Crafting Settings
	gen1FragmentRequired: number;
	gen1CraftingSuccessRate: number;
	gen1CraftingFee: number;
	gen1FragmentLostOnFailure: number;

	// GEN2 Opening Settings
	gen2OpeningFee: number;

	// Lucky Leaf Settings
	luckyLeafItemId?: string;
	luckyLeafQuantityRequired: number;
	luckyLeafSuccessRateBoost: number;

	// Character Generation Settings
	characterStatRanges: {
		strength: { min: number; max: number };
		defense: { min: number; max: number };
		speed: { min: number; max: number };
		hp: { min: number; max: number };
	};
	characterLifetimeRangesInHours: {
		min: number; // in hours
		max: number; // in hours
	};
	characterDropRates: {
		gen1: Record<string, number>; // character_class -> drop_rate
		gen2: Record<string, number>; // character_class -> drop_rate
	};

	// General Settings
	eggNullCwRate: number;
}

// TODO: need to config break level for skill which require red_stone
/*
 this is used when levelup skill.
*/
export interface ISkillGenerationConfig {
	damage: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	criticalStrike: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	armor: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	armorPenetration: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	damageReflection: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	lifeSteal: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	poison: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	antiToxic: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	firePoison: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	hpRecovery: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	vitalElixir: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
	antidote: {
		rate: ESkillAttributeRate;
		min: number;
		max: number;
	};
}

export interface IMarketTradeConfig {
	automaticCancelDurationInHours: number;
	commissionFeePercentage: number;
	commissionFeeType: EGameCurrencyType;
}
