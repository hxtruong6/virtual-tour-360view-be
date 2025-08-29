import {
	type Insertable,
	type JSONColumnType,
	type Selectable,
	type Updateable,
} from 'kysely';

import { type EAdminRoleType } from '../../common/constants';
import { BaseEntity, BaseEntityFields } from './common.entity';

export class AdminTable extends BaseEntity {
	userId!: string; // References app.users(id)

	username!: string; // Admin username

	email?: string; // Admin email

	role!: EAdminRoleType; // 'super_admin', 'operator', 'guest'

	permissions!: JSONColumnType<string[], string | null, string | null>; // Array of permission strings

	isActive!: boolean;

	lastLoginAt?: Date;

	loginAttempts!: number;

	lastFailedLoginAt?: Date;

	passwordHash!: string; // Admin password hash
}

export type TAdmin = Selectable<AdminTable>;
export type TAdminInsert = Insertable<AdminTable>;
export type TAdminUpdate = Updateable<AdminTable>;

export const adminModelFields = {
	...BaseEntityFields,
	userId: 'userId',
	username: 'username',
	email: 'email',
	role: 'role',
	permissions: 'permissions',
	isActive: 'isActive',
	lastLoginAt: 'lastLoginAt',
	loginAttempts: 'loginAttempts',
	lastFailedLoginAt: 'lastFailedLoginAt',
	passwordHash: 'passwordHash',
} as const;
