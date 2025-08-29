import { type JSONColumnType } from 'kysely';

import { EAccountStatus, EUserType } from '../../../../common/constants';
import { BaseDto } from '../../../../common/dto/abstract.dto';
import { type PageMetaDto } from '../../../../common/dto/page-meta.dto';
import { PageDto } from '../../../../common/dto/page.dto';
import { IUserMetadata, TUser } from '../../../../core/entities';
import {
	BooleanFieldOptional,
	DateFieldOptional,
	EnumFieldOptional,
	JsonFieldOptional,
	NumberField,
	NumberFieldOptional,
	StringField,
	StringFieldOptional,
} from '../../../../decorators';

export class UserListResponseDto extends PageDto<UserDto> {
	constructor(data: UserDto[], meta: PageMetaDto) {
		super(data, meta);
	}
}

export class UserDto extends BaseDto {
	@StringField()
	readonly username!: string;

	@StringFieldOptional()
	email?: string;

	@StringFieldOptional()
	phoneNumber?: string;

	@StringFieldOptional()
	phoneCountryCode?: string;

	@StringFieldOptional()
	passwordHash?: string;

	@StringFieldOptional()
	walletAddress?: string;

	@StringFieldOptional()
	displayName?: string;

	@StringFieldOptional()
	avatarUrl?: string;

	@NumberField()
	level!: number;

	@NumberField()
	experiencePoints!: number;

	@DateFieldOptional()
	lastLogin?: Date;

	@StringFieldOptional()
	referralCode?: string;

	@StringFieldOptional()
	referredBy?: string;

	@StringFieldOptional()
	langTag?: string; // language tag is ISO 639-1 code (e.g. en, vi, th, etc.)

	@StringFieldOptional()
	location?: string; // country code (e.g. US, UK, etc.)

	@StringFieldOptional()
	timezone?: string; // timezone (e.g. Asia/Tokyo, Europe/London, etc.)

	@EnumFieldOptional(() => EAccountStatus)
	accountStatus?: EAccountStatus;

	@DateFieldOptional()
	accountStatusAt?: Date;

	@NumberFieldOptional()
	loginAttempts?: number;

	@DateFieldOptional()
	lastFailedLoginAt?: Date | null;

	@DateFieldOptional()
	accountVerifiedAt?: Date;

	@DateFieldOptional()
	emailVerifiedAt?: Date;

	@DateFieldOptional()
	phoneNumberVerifiedAt?: Date;

	@StringFieldOptional()
	nkAccountId?: string;

	@JsonFieldOptional()
	metadata?: JSONColumnType<IUserMetadata, string | null, string | null>;

	@BooleanFieldOptional()
	enableFarming?: boolean;

	@EnumFieldOptional(() => EUserType)
	userType?: EUserType;

	constructor(data: TUser) {
		super();
		Object.assign(this, data);
	}
}
