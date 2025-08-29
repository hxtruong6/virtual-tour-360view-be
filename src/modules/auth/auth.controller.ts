import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { EUserType } from '../../common/constants';
import { TUser } from '../../core/entities/user.entity';
import { Auth } from '../../decorators';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { AuthService } from './auth.service';
import { ResponseUserDto } from './dto/auth.common.dto';
import {
	RequestUserLoginDto,
	RequestUserRegisterDto,
	RequestWalletAddressLoginDto,
} from './dto/auth.request.dto';
import { RegisterUserResponseDto } from './dto/auth.response.dto';
import { LoginPayloadDto } from './dto/login-payload.dto';

@Controller({ path: '/markets/auth', version: '1' })
@ApiTags('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(private authService: AuthService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		type: LoginPayloadDto,
		description: 'User info with access token',
	})
	async userLogin(
		@Body() userLoginDto: RequestUserLoginDto,
	): Promise<LoginPayloadDto> {
		return this.authService.login(userLoginDto);
	}

	@Post('login-wallet-address')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		type: LoginPayloadDto,
		description: 'User info with access token',
	})
	walletAddressLogin(
		@Body() walletAddressLoginDto: RequestWalletAddressLoginDto,
	): Promise<LoginPayloadDto> {
		return this.authService.loginWalletAddress(walletAddressLoginDto);
	}

	@Post('register')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		type: ResponseUserDto,
		description: 'Successfully Registered',
	})
	// @ApiFile({ name: 'avatar' })
	userRegister(
		@Body() userRegisterDto: RequestUserRegisterDto,
		// @UploadedFile() file?: IFile,
	): Promise<RegisterUserResponseDto> {
		return this.authService.registerMarketplaceAccount(userRegisterDto);
	}

	@Get('me')
	@HttpCode(HttpStatus.OK)
	@Auth({
		userTypes: [EUserType.USER],
	})
	@ApiOkResponse({
		type: ResponseUserDto,
		description: 'Current user profile information',
	})
	async getUserProfile(@AuthUser() user: TUser): Promise<ResponseUserDto> {
		return this.authService.getUserProfile(user.id);
	}
}
