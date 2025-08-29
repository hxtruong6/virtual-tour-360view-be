import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { EUserType, TokenType } from '../../common/constants';
import { AuthenUser } from '../../core/entities';
import { User, UserRole, UserStatus } from '../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiConfigService } from '../../shared/services/api-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	private readonly logger = new Logger(JwtStrategy.name);

	constructor(
		configService: ApiConfigService,
		private readonly prisma: PrismaService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			// secretOrKey: configService.authConfig.publicKey,
			secretOrKey: configService.authConfig.secret,
		});
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async validate(args: {
		userId: string;
		username: string;
		type: TokenType;
		userType: EUserType;
	}): Promise<AuthenUser> {
		if (args.type !== TokenType.ACCESS_TOKEN) {
			throw new UnauthorizedException('Invalid token type');
		}

		let user: User | null;

		if (args.userType === EUserType.ADMIN) {
			// Use Prisma to get admin user
			user = await this.prisma.user.findFirst({
				where: {
					id: args.userId,
					role: {
						in: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
					},
					status: UserStatus.ACTIVE,
					deletedAt: null,
				},
			});
		} else {
			throw new UnauthorizedException('Only admin users are supported');
		}

		if (!user) {
			throw new UnauthorizedException('User not found or inactive');
		}

		return new AuthenUser(user);
	}
}
