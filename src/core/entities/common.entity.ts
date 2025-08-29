import { type ColumnType, type Generated } from 'kysely';

export class BaseEntity {
	id!: Generated<string>;

	createdAt!: Generated<Date>;

	updatedAt!: ColumnType<
		Date | undefined,
		Date | string | undefined,
		Date | string | undefined
	>;

	// "never" is for the insert operation
	deletedAt!: ColumnType<Date | undefined, never, Date | string | undefined>;

	createdBy!: string | Uuid | null;

	updatedBy!: string | Uuid | null;

	deletedBy!: string | Uuid | null;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BaseEntityFields = {
	id: 'id',
	createdAt: 'createdAt',
	updatedAt: 'updatedAt',
	deletedAt: 'deletedAt',
	createdBy: 'createdBy',
	updatedBy: 'updatedBy',
	deletedBy: 'deletedBy',
} as const;

export class PhoneNumber {
	countryCode!: string | null;

	number!: string | null;
}

export interface IAuthUser {
	id: string;
	username: string;
	email: string | null;
	nkAccountId: string;
	accountStatus: string;
}
