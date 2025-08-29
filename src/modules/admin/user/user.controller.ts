import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EAdminRoleType, EUserType } from '../../../common/constants';
import { Auth } from '../../../decorators';
import { UserRequestDto } from './dto/admin-user.request.dto';
import { UserListResponseDto } from './dto/admin-user.response.dto';
import { UserUseCase } from './user.use-case';

@Controller({ path: '', version: '1' })
@ApiTags('admin/user-management')
export class UserController {
	constructor(private readonly userUseCase: UserUseCase) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get all characters',
		description: 'Admin API to get all characters',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Characters retrieved successfully',
		type: UserListResponseDto,
	})
	@Auth({
		userTypes: [EUserType.ADMIN],
		adminRoles: [EAdminRoleType.DEVELOPER, EAdminRoleType.SUPER_ADMIN],
	})
	async getUsers(@Query() query: UserRequestDto) {
		return this.userUseCase.getUsers(query);
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get user by id',
		description: 'Admin API to get user by id',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'User retrieved successfully',
	})
	@Auth({
		userTypes: [EUserType.ADMIN],
		adminRoles: [EAdminRoleType.DEVELOPER, EAdminRoleType.SUPER_ADMIN],
	})
	async getUserById(@Param('id') id: string) {
		return this.userUseCase.getUserById(id);
	}
}
