import { Expose, plainToInstance } from 'class-transformer';

import { TAdmin } from '../../../core/entities/admin.entity';
import { TUser } from '../../../core/entities/user.entity';
import {
	DateFieldOptional,
	EmailFieldOptional,
	JsonFieldOptional,
	PhoneFieldOptional,
	StringField,
	StringFieldOptional,
	UUIDField,
} from '../../../decorators';

export class ResponseUserDto {
	@Expose()
	@UUIDField()
	readonly id!: Uuid;

	@Expose()
	@StringField({ minLength: 3 })
	readonly username!: string;

	@Expose()
	@EmailFieldOptional()
	readonly email!: string;

	@Expose()
	@PhoneFieldOptional()
	readonly phoneNumber!: string;

	@Expose()
	@StringFieldOptional({ minLength: 2, maxLength: 4 })
	readonly phoneCountryCode!: string;

	@Expose()
	@StringFieldOptional({ minLength: 4 })
	readonly walletAddress!: string;

	@Expose()
	@StringField({ minLength: 4 })
	readonly displayName!: string;

	@Expose()
	@StringFieldOptional({ minLength: 4 })
	readonly avatarUrl!: string;

	@Expose()
	@StringFieldOptional({ minLength: 4 })
	readonly accountStatus!: string;

	@Expose()
	@StringFieldOptional({ minLength: 4 })
	readonly location!: string;

	@Expose()
	@StringFieldOptional({ minLength: 4 })
	readonly timezone!: string;

	@Expose()
	@DateFieldOptional()
	readonly accountVerifiedAt!: Date;

	@Expose()
	@DateFieldOptional()
	readonly emailVerifiedAt!: Date;

	@Expose()
	@DateFieldOptional()
	readonly phoneNumberVerifiedAt!: Date;

	@Expose()
	@JsonFieldOptional()
	readonly metadata!: Record<string, unknown>;

	constructor(user: TUser) {
		const plainUser = plainToInstance(ResponseUserDto, user, {
			excludeExtraneousValues: true,
		});
		Object.assign(this, plainUser);
	}
}

export class ResponseAdminDto {
	@UUIDField()
	readonly id!: Uuid;

	@StringField({ minLength: 3 })
	readonly username!: string;

	@StringFieldOptional()
	readonly email!: string;

	@StringFieldOptional()
	readonly displayName!: string;

	@StringField({ minLength: 3 })
	readonly role!: string;

	@StringField({ minLength: 3 })
	readonly permissions!: string;

	constructor(admin: TAdmin) {
		const plainAdmin = plainToInstance(ResponseAdminDto, admin, {
			excludeExtraneousValues: true,
		});
		Object.assign(this, plainAdmin);
	}
}
