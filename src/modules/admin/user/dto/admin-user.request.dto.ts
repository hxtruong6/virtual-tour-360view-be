import { EAccountStatus } from '../../../../common/constants';
import { PageOptionsDto } from '../../../../common/dto/page-options.dto';
import { EnumFieldOptional, StringFieldOptional } from '../../../../decorators';

export class UserRequestDto extends PageOptionsDto {
	@StringFieldOptional({
		description: 'Username',
	})
	readonly username?: string;

	@StringFieldOptional({
		description: 'Email',
	})
	readonly email?: string;

	@EnumFieldOptional(() => EAccountStatus, {
		description: 'Account status',
	})
	readonly accountStatus?: EAccountStatus;
}
