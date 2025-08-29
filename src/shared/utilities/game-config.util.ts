import { type IGameConfigMapPvELevelConfig } from '../../common/constants/game-config.type';
import { type IItemRepository } from '../../modules/cwgame/cw-items.repository';

// {
//     level: 24,
//     energyLose: 28,
//     characterLevel: { minLevel: 38, maxLevel: 48 },
//     receiveExp: {
//         characterMinExp: 125,
//         characterMaxExp: 135,
//         userMinExp: 62,
//         userMaxExp: 72,
//     },
//     reward: { currency: EGameCurrencyType.COIN, amount: 125 },
//     probabilityWin: 0,
//     dropItems: [
//         { itemCode: 'MANA_POTION', quantity: 1, probability: 70 },
//         { itemCode: 'EPIC_HELMET', quantity: 1, probability: 10 },
//     ],
// },

export async function validateMapPvEConfig(
	levelConfig: IGameConfigMapPvELevelConfig,
	itemRepository: IItemRepository,
): Promise<void> {
	if (levelConfig.level < 0) {
		throw new Error('Level must be greater than 0');
	}

	if (levelConfig.energyLose < 0) {
		throw new Error('Energy lose must be greater than 0');
	}

	if (levelConfig.characterLevel.minLevel < 0) {
		throw new Error('Character level must be greater than 0');
	}

	if (levelConfig.characterLevel.maxLevel < 0) {
		throw new Error('Character level must be greater than 0');
	}

	if (
		levelConfig.characterLevel.minLevel > levelConfig.characterLevel.maxLevel
	) {
		throw new Error('Character level min must be less than max');
	}

	if (levelConfig.receiveExp.characterMinExp < 0) {
		throw new Error('Character min exp must be greater than 0');
	}

	if (levelConfig.receiveExp.characterMaxExp < 0) {
		throw new Error('Character max exp must be greater than 0');
	}

	if (levelConfig.receiveExp.userMinExp < 0) {
		throw new Error('User min exp must be greater than 0');
	}

	if (levelConfig.receiveExp.userMaxExp < 0) {
		throw new Error('User max exp must be greater than 0');
	}

	if (levelConfig.probabilityWin < 0 || levelConfig.probabilityWin > 100) {
		throw new Error('Probability win must be between 0 and 100');
	}

	// verify each drop item
	for (const dropItem of levelConfig.dropItems) {
		if (dropItem.probability < 0 || dropItem.probability > 100) {
			throw new Error('Drop item probability must be between 0 and 100');
		}
	}

	// verify item code
	const items = await itemRepository.getItemByItemCodes(
		levelConfig.dropItems.map((item) => item.itemCode),
		['id'],
	);

	if (!items || items.length !== levelConfig.dropItems.length) {
		throw new Error(
			`Item with code ${levelConfig.dropItems[0].itemCode} not found`,
		);
	}
}
