/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

import { ISocketWithUser } from '../../common/types';

@Injectable()
export class WsAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client: ISocketWithUser = context.switchToWs().getClient();

		const token =
			client.handshake.auth.token || // Priority the auth token
			client.handshake.headers.authorization?.split(' ')[1] || // Then the authorization header
			client.handshake.query.token; // Then the query token

		if (!token) {
			throw new WsException('Authorization is required');
		}

		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const payload = await this.jwtService.verifyAsync(token as string);

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			client.user = { ...payload, id: payload.userId };

			return true;
		} catch (error) {
			console.error({
				message: 'Error verifying token',
				error,
				token,
			});

			return false;
		}
	}
}
