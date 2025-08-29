import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { EVersion } from '../../common/constants';
import { AuthService } from './auth.service';
import { RequestAdminLoginDto } from './dto/admin-auth.request.dto';
import { LoginPayloadDto } from './dto/login-payload.dto';

@Controller({ path: '/auth', version: EVersion.V1 })
@ApiTags('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(private authService: AuthService) {}

	@Post('login-admin')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		type: LoginPayloadDto,
		description: 'Admin info with access token',
	})
	adminLogin(
		@Body() adminLoginDto: RequestAdminLoginDto,
	): Promise<LoginPayloadDto> {
		return this.authService.adminLogin(adminLoginDto);
	}

	// @Post('register')
	// @HttpCode(HttpStatus.OK)
	// @ApiOkResponse({
	// 	type: ResponseUserDto,
	// 	description: 'Successfully Registered',
	// })
	// // @ApiFile({ name: 'avatar' })
	// userRegister(
	// 	@Body() userRegisterDto: RequestUserRegisterDto,
	// 	// @UploadedFile() file?: IFile,
	// ): Promise<RegisterUserResponseDto> {
	// 	return this.authService.registerMarketplaceAccount(userRegisterDto);
	// }

	// @Get('me')
	// @HttpCode(HttpStatus.OK)
	// @Auth({
	// 	userTypes: [EUserType.USER],
	// })
	// @ApiOkResponse({
	// 	type: ResponseUserDto,
	// 	description: 'Current user profile information',
	// })
	// getUserProfile(@AuthUser() user: TUser): ResponseUserDto {
	// 	return this.authService.getUserProfile(user.id);
	// }
}
