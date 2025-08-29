import { ClassField } from '../../../decorators';
import { ResponseUserDto } from './auth.common.dto';
import { TokenPayloadDto } from './token-payload.dto';

export class RegisterUserResponseDto {
	@ClassField(() => ResponseUserDto)
	user: ResponseUserDto;

	@ClassField(() => TokenPayloadDto)
	setupPasswordToken?: TokenPayloadDto;

	constructor(user: ResponseUserDto, setupPasswordToken?: TokenPayloadDto) {
		this.user = user;
		this.setupPasswordToken = setupPasswordToken;
	}
}
