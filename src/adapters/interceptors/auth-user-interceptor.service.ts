/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common';

import { ContextProvider } from '../../common/providers';
import { type TUser } from '../../core/entities/user-old.entity';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const request = context.switchToHttp().getRequest();
		// console.info('xxx 799 request:', request.user);

		const user = <TUser>request.user;
		ContextProvider.setAuthUser(user);

		return next.handle();
	}
}
