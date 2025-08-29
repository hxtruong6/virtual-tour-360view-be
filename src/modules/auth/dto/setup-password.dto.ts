import { IsOptional, IsString } from 'class-validator';

import {
	StringField,
	StringFieldOptional,
	UUIDField,
} from '../../../decorators';

export class SetupPasswordDto {
	@StringFieldOptional()
	token?: string;

	@StringField()
	password!: string;

	@UUIDField()
	userId!: Uuid;
}

export class ForgotPasswordDto {
	@IsString()
	@IsOptional()
	email?: string;

	@IsString()
	@IsOptional()
	phone?: string;
}
