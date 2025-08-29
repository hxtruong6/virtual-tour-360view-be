import {
	type User,
	type UserRole,
	type UserStatus,
} from '../../generated/prisma';

export class AuthenUser {
	id!: string;

	email!: string;

	username!: string | null;

	firstName!: string | null;

	lastName!: string | null;

	role!: UserRole;

	status!: UserStatus;

	timezone!: string;

	constructor(user: User & { options?: Record<string, unknown> }) {
		Object.assign(this, user);
	}
}
