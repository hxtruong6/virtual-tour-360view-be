/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	canActivate(context: ExecutionContext): boolean {
		const client = context.switchToWs().getClient();

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		const token = client.handshake.headers.authorization?.split(' ')[1];

		if (!token) {
			return false;
		}

		try {
			const user = this.jwtService.verify(token as string);
			client.user = user; // Attach user info to client

			return true;
		} catch {
			return false;
		}
	}
}
