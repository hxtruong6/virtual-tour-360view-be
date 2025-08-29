import { Expose } from 'class-transformer';

import {
	EmailFieldOptional,
	PasswordField,
	PhoneField,
	PhoneFieldOptional,
	StringField,
	StringFieldOptional,
	UUIDField,
} from '../../../decorators';

export class RequestSendOtpDto {
	@Expose()
	@StringFieldOptional()
	readonly phone?: string;

	@Expose()
	@EmailFieldOptional({ toLowerCase: true })
	readonly email?: string;

	@Expose()
	@UUIDField()
	readonly userId!: Uuid;

	// @Expose()
	// @EnumFieldOptional(() => EOtpPurpose)
	// readonly purpose?: EOtpPurpose;
}

export class RequestVerifyOtpDto extends RequestSendOtpDto {
	@StringField()
	readonly otp!: string;
}

export class RequestDeactivateAccountDto {
	@PhoneField()
	readonly phone!: string;
}

export class RequestUserRegisterDto {
	@StringField({ minLength: 3 })
	readonly username!: string;

	@EmailFieldOptional({ toLowerCase: true })
	readonly email?: string;

	@StringFieldOptional()
	readonly phoneNumber?: string;

	@StringFieldOptional({ minLength: 2, maxLength: 4 })
	readonly phoneCountryCode?: string;

	@StringFieldOptional({ minLength: 3 })
	readonly displayName?: string;

	@PasswordField({ minLength: 4 })
	readonly password!: string;

	@StringFieldOptional({ minLength: 4 })
	readonly walletAddress?: string;
}

export class RequestUserLoginDto {
	@StringFieldOptional({ minLength: 3 })
	readonly username?: string;

	@EmailFieldOptional({ toLowerCase: true })
	readonly email?: string;

	@PasswordField({ minLength: 4 })
	readonly password!: string;

	@StringFieldOptional()
	readonly walletAddress?: string;
}

export class RequestWalletAddressLoginDto {
	@StringField({ minLength: 4 })
	readonly walletAddress!: string;
}
