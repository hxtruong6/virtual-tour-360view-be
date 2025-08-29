import { PasswordField, StringField } from '../../../decorators';

export class RequestAdminLoginDto {
	@StringField({ minLength: 3, toLowerCase: true })
	readonly username!: string;

	@PasswordField({ minLength: 4 })
	readonly password!: string;
}
