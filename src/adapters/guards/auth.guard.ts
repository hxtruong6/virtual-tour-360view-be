import {
	type IAuthGuard,
	AuthGuard as NestAuthGuard,
	type Type,
} from '@nestjs/passport';

export function AuthGuard(
	options?: Partial<{ public: boolean }>,
): Type<IAuthGuard> {
	const strategies = ['jwt'];

	if (options?.public) {
		strategies.push('public');
	}

	return NestAuthGuard(strategies);
}
