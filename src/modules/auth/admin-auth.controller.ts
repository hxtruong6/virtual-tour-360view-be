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

import { EAdminRoleType, EUserType } from '../../common/constants';
import { TAdmin } from '../../core/entities/admin.entity';
import { Auth } from '../../decorators';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { AuthService } from './auth.service';
import { RequestAdminLoginDto } from './dto/admin-auth.request.dto';
import { AdminLoginResponseDto } from './dto/admin-auth.response.dto';
import { ResponseAdminDto } from './dto/auth.common.dto';
import { LoginPayloadDto } from './dto/login-payload.dto';

@Controller({ path: '/admin/auth', version: '1' })
@ApiTags('admin/auth')
export class AdminAuthController {
	private readonly logger = new Logger(AdminAuthController.name);

	constructor(private authService: AuthService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOkResponse({
		type: AdminLoginResponseDto,
		description: 'Admin info with access token',
	})
	adminLogin(
		@Body() adminLoginDto: RequestAdminLoginDto,
	): Promise<LoginPayloadDto> {
		return this.authService.adminLogin(adminLoginDto);
	}

	@Get('me')
	@HttpCode(HttpStatus.OK)
	@Auth({
		userTypes: [EUserType.ADMIN],
		adminRoles: [EAdminRoleType.DEVELOPER, EAdminRoleType.SUPER_ADMIN],
	})
	@ApiOkResponse({
		type: ResponseAdminDto,
		description: 'Current admin profile information',
	})
	async getAdminProfile(@AuthUser() admin: TAdmin): Promise<ResponseAdminDto> {
		return this.authService.getAdminProfile(admin.id);
	}
}
