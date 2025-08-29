/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import _ from 'lodash';

import { type EAdminRoleType } from '../../common/constants';
import { TAdmin } from '../../core/entities/admin.entity';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.get<EAdminRoleType[]>(
			'roles',
			context.getHandler(),
		);

		// eslint-disable-next-line sonarjs/prefer-single-boolean-return
		if (_.isEmpty(roles)) {
			return true;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const request = context.switchToHttp().getRequest();
		const user = <TAdmin & { role: EAdminRoleType }>request.user;

		// Only Admin need to check role. Expert and Customer don't have role.
		// if (user.userType !== EUserType.ADMIN) {
		// 	return true;
		// }

		if (roles.includes(user.role)) {
			return true;
		}

		throw new ForbiddenException('You are not allowed to access this resource');
	}
}
