import {
	JsonFieldOptional,
	StringFieldOptional,
} from '../../decorators/field.decorators';

export class PhoneNumberDto {
	@StringFieldOptional()
	readonly phoneNumber?: string;

	@StringFieldOptional()
	readonly countryCode?: string;
}

// success response dto
export class SuccessResponseDto {
	@StringFieldOptional()
	readonly message?: string;

	@JsonFieldOptional()
	readonly data?: Record<string, unknown>;

	constructor(message?: string, data?: Record<string, unknown>) {
		this.message = message;
		this.data = data;
	}
}
