export interface IBaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
	createdBy: string;
	updatedBy: string;
	deletedBy: string;
}

export interface IUserRef {
	id: string;
	username: string;
	displayName?: string;
	avatarUrl?: string;
	nkAccountId?: string;
}
