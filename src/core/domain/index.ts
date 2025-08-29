export interface IUserRanking {
	userId: string;
	username: string;
	displayName: string;
	avatarUrl: string;
	nkAccountId: string;
	rank: number;
	totalExp: number; // all active character exp + land exp
	totalCharacterExp: number; // all active character exp
	clanId: string; // user have only one clan
	clanName: string;
	clanAvatarUrl: string;
	landId: string; // user have only one land
	landLevel: number;
	landExp: number;
	landSeasonType: string;
	// all active character
	characters: Array<{
		id: string;
		name: string;
		rarity: string;
		level: number;
		experiencePoints: number;
	}>;
}

export interface ILandRanking {
	userId: string;
	username: string;
	displayName: string;
	avatarUrl: string;
	nkAccountId: string;
	rank: number;
	landId: string; // user have only one land
	landLevel: number;
	landExp: number;
	landSeasonType: string;
}
