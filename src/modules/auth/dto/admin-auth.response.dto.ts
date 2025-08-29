import { type EAdminRoleType } from '../../../common/constants';
import {
	NumberField,
	StringField,
	StringFieldOptional,
} from '../../../decorators';

export class AdminLoginResponseDto {
	@StringField()
	readonly id!: string;

	@StringField()
	readonly username!: string;

	@StringFieldOptional()
	readonly email?: string;

	@StringField()
	readonly displayName?: string;

	@StringField()
	readonly role!: EAdminRoleType;

	@StringField()
	readonly permissions!: string[];

	@StringField()
	readonly accessToken!: string;

	@StringField()
	readonly refreshToken!: string;

	@NumberField()
	readonly expiresIn!: number;

	constructor(data: {
		id: string;
		username: string;
		email?: string;
		displayName?: string;
		role: EAdminRoleType;
		permissions: string[];
		accessToken: string;
		refreshToken: string;
		expiresIn: number;
	}) {
		Object.assign(this, data);
	}
}
