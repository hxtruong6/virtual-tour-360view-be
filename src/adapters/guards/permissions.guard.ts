/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import _ from 'lodash';

import { TUser } from '../../core/entities/user.entity';
import { PERMISSIONS_KEY } from '../../decorators/permissions.decorator';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
	private readonly logger = new Logger(PermissionsGuard.name);

	constructor(
		private readonly reflector: Reflector,
		private readonly authService: AuthService,
	) {}

	// eslint-disable-next-line @typescript-eslint/require-await
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
			PERMISSIONS_KEY,
			[context.getHandler(), context.getClass()],
		);

		// If no permissions are required, allow access
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!requiredPermissions || _.isEmpty(requiredPermissions)) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const user = request.user as TUser; // Assuming user is attached by a previous Auth guard

		// If user is not attached or not an Admin, deny access (or handle based on your logic)
		// This check might be redundant if AuthGuard runs first and handles non-admin cases
		// if (user.userType !== EUserType.ADMIN) {
		// 	// Let RolesGuard or main AuthGuard handle non-admin access logic
		// 	// Or throw ForbiddenException if only Admins with specific permissions should ever reach this point
		// 	return true; // Assuming non-admins are handled elsewhere or don't need permission checks
		// }

		// // Super Admins bypass permission checks
		// if (user.role === EAdminRoleType.SUPER_ADMIN) {
		// 	return true;
		// }

		this.logger.debug(
			`User ${user.id} requires permissions: ${requiredPermissions.join(', ')}`,
		);

		// const userPermissions = await this.authService.getRolePermissions(
		// 	user.id as Uuid,
		// );

		// // Check if the user has all the required permissions
		// const hasAllPermissions = requiredPermissions.every((permission) =>
		// 	userPermissions.has(permission),
		// );

		// if (!hasAllPermissions) {
		// 	this.logger.warn(
		// 		`User ${user.id} lacks required permissions: ${requiredPermissions.join(', ')}`,
		// 	);

		// 	throw new ForbiddenException(
		// 		'You do not have the required permissions to access this resource.',
		// 	);
		// }

		return true;
	}
}
