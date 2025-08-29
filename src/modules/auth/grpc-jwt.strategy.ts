/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Metadata } from '@grpc/grpc-js';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { EUserType, GrpcStatus, TokenType } from '../../common/constants';
import { IDataServices } from '../../core/abstract';
import { TUser } from '../../core/entities/user.entity';
import { ApiConfigService } from '../../shared/services/api-config.service';

@Injectable()
export class GrpcJwtStrategy extends PassportStrategy(Strategy, 'grpc-jwt') {
	private readonly logger = new Logger(GrpcJwtStrategy.name);

	constructor(
		configService: ApiConfigService,
		private readonly dataServices: IDataServices,
	) {
		super({
			jwtFromRequest: (req) => {
				// Extract token from gRPC metadata
				if (req?.metadata) {
					const metadata = req.metadata as Metadata;
					const authHeader = metadata.get('authorization')[0] as string;

					if (authHeader && authHeader.startsWith('Bearer ')) {
						return authHeader.slice(7); // Remove 'Bearer ' prefix
					}
				}

				return null;
			},
			secretOrKey: configService.authConfig.secret,
			passReqToCallback: true,
		});
	}

	async validate(
		req: { metadata: Metadata; user?: TUser },
		payload: {
			userId: Uuid;
			role?: string;
			type: TokenType;
			userType: EUserType;
		},
	): Promise<TUser> {
		this.logger.debug(`Validating gRPC JWT token for user: ${payload.userId}`);

		if (payload.type !== TokenType.ACCESS_TOKEN) {
			throw new UnauthorizedException('Invalid token type');
		}

		// Fetch user from database using the data services
		const user = await this.dataServices.users.getAuthUser(
			payload.userId as string,
		);

		console.info('[grpc-jwt-strategy] GrpcJwtStrategy', user);

		if (!user?.id || !(user as Record<string, unknown>).isActive) {
			// throw new UnauthorizedException('User not found or inactive');
			throw new RpcException({
				code: GrpcStatus.UNAUTHENTICATED,
				message: 'User not found or inactive',
			});
		}

		// Attach user to request for later use
		req.user = user;

		return user;
	}
}
