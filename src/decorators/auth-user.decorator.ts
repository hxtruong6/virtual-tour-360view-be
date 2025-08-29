/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

export function AuthUser(): ParameterDecorator {
	return createParamDecorator((_data: unknown, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest();

		const user = request.user;
		// console.info('xxx 262 Auth User Decorator user:', user);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if (user?.[Symbol.for('isPublic')]) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return user;
	})();
}
