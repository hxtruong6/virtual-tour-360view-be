/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import _ from 'lodash';

import { type EUserType } from '../../common/constants';

@Injectable()
export class UserTypeGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const userTypes = this.reflector.get<EUserType[]>(
			'userTypes',
			context.getHandler(),
		);

		if (_.isEmpty(userTypes)) {
			return true;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const request = context.switchToHttp().getRequest();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const user = request.user;

		if (!user?.id) {
			throw new UnauthorizedException('User not found');
		}

		if (!userTypes.includes(user.userType)) {
			throw new ForbiddenException(`User type ${user.userType} not allowed`);
		}

		return true;
	}
}
