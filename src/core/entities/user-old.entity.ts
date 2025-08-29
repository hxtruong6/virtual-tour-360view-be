import {
	type Insertable,
	type JSONColumnType,
	type Selectable,
	type Updateable,
} from 'kysely';

import { type EAccountStatus, type EUserType } from '../../common/constants';
import { BaseEntity, BaseEntityFields } from './common.entity';

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface IUserMetadata {
	[key: string]: unknown;
}

export class UserTable extends BaseEntity {
	username!: string;

	email?: string;

	phoneNumber?: string;

	phoneCountryCode?: string;

	passwordHash?: string;

	walletAddress?: string;

	displayName?: string;

	avatarUrl?: string;

	level!: number;

	experiencePoints!: number;

	lastLogin?: Date;

	referralCode?: string;

	referredBy?: string;

	langTag?: string; // language tag is ISO 639-1 code (e.g. en, vi, th, etc.)

	location?: string; // country code (e.g. US, UK, etc.)

	timezone?: string; // timezone (e.g. Asia/Tokyo, Europe/London, etc.)

	accountStatus?: EAccountStatus;

	accountStatusAt?: Date;

	loginAttempts?: number;

	lastFailedLoginAt?: Date | null;

	accountVerifiedAt?: Date;

	emailVerifiedAt?: Date;

	phoneNumberVerifiedAt?: Date;

	nkAccountId?: string;

	metadata?: JSONColumnType<IUserMetadata, string | null, string | null>;

	enableFarming?: boolean;

	userType?: EUserType;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserModelFields = {
	...BaseEntityFields,
	username: 'username',
	email: 'email',
	phoneNumber: 'phoneNumber',
	phoneCountryCode: 'phoneCountryCode',
	passwordHash: 'passwordHash',
	walletAddress: 'walletAddress',
	displayName: 'displayName',
	avatarUrl: 'avatarUrl',
	level: 'level',
	experiencePoints: 'experiencePoints',
	lastLogin: 'lastLogin',
	referralCode: 'referralCode',
	referredBy: 'referredBy',
	langTag: 'langTag',
	location: 'location',
	timezone: 'timezone',
	accountStatus: 'accountStatus',
	accountStatusAt: 'accountStatusAt',
	loginAttempts: 'loginAttempts',
	lastFailedLoginAt: 'lastFailedLoginAt',
	accountVerifiedAt: 'accountVerifiedAt',
	emailVerifiedAt: 'emailVerifiedAt',
	phoneNumberVerifiedAt: 'phoneNumberVerifiedAt',
	nkAccountId: 'nkAccountId',
	metadata: 'metadata',
	enableFarming: 'enableFarming',
} as const;

export type TUser = Selectable<UserTable>;
export type TCreateUser = Insertable<UserTable>;
export type TUpdateUser = Updateable<UserTable>;
