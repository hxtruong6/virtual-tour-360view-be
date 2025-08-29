/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	Logger,
	type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import { GrpcStatus } from '../../common/constants';
import { IDataServices } from '../../core/abstract';

interface IGrpcDataWithAuth {
	authPayload?: {
		userId: string;
		type: string;
		userType: string;
	};
}

@Injectable()
export class GrpcAuthUserInterceptor implements NestInterceptor {
	private readonly logger = new Logger(GrpcAuthUserInterceptor.name);

	constructor(
		private readonly dataServices: IDataServices,
		private readonly reflector: Reflector,
	) {}

	async intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Promise<Observable<unknown>> {
		if (context.getType() === 'http') {
			return next.handle();
		}

		const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return next.handle();
		}

		const rpcContext = context.switchToRpc();
		const data: IGrpcDataWithAuth = rpcContext.getData();

		// Get the auth payload that was validated by the guard
		const authPayload = data.authPayload;

		if (!authPayload) {
			this.logger.warn('No auth payload found - guard may not have run');

			return next.handle();
		}

		try {
			// Fetch user from database using the validated payload
			const user = await this.dataServices.users.getAuthUser(
				authPayload.userId,
			);

			if (!user?.id) {
				throw new RpcException({
					code: GrpcStatus.UNAUTHENTICATED,
					message: 'User not found',
				});
			}

			rpcContext.getData().authUser = user;

			// this.logger.log({
			// 	message: `User context set for gRPC request: ${user.id}`,
			// 	rpcContext: rpcContext.getData(),
			// });

			return next.handle();
		} catch (error) {
			this.logger.error({
				message: 'Failed to fetch user for context',
				error,
			});

			throw new RpcException({
				code: GrpcStatus.UNAUTHENTICATED,
				message: 'Failed to fetch user for context',
				error,
			});
		}
	}
}
