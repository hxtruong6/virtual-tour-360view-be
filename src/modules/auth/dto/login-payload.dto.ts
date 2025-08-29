import { ClassField } from '../../../decorators';
import { ResponseAdminDto, ResponseUserDto } from './auth.common.dto';
import { TokenPayloadDto } from './token-payload.dto';

export class LoginPayloadDto {
	@ClassField(() => ResponseUserDto)
	user: ResponseUserDto | ResponseAdminDto;

	@ClassField(() => TokenPayloadDto)
	token: TokenPayloadDto;

	constructor(
		user: ResponseUserDto | ResponseAdminDto,
		token: TokenPayloadDto,
	) {
		this.user = user;
		this.token = token;
	}
}
