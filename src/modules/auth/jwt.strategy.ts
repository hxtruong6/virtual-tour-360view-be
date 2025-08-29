import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import {
	type EAdminRoleType,
	EUserType,
	TokenType,
} from '../../common/constants';
import { IDataServices } from '../../core/abstract';
import { TAdmin } from '../../core/entities/admin.entity';
import { TUser } from '../../core/entities/user.entity';
import { ApiConfigService } from '../../shared/services/api-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	private readonly logger = new Logger(JwtStrategy.name);

	constructor(
		configService: ApiConfigService,
		private readonly dataServices: IDataServices,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			// secretOrKey: configService.authConfig.publicKey,
			secretOrKey: configService.authConfig.secret,
		});
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async validate(args: {
		userId: Uuid;
		role: EAdminRoleType;
		type: TokenType;
		userType: EUserType;
	}): Promise<TUser | TAdmin> {
		console.info('[JwtStrategy] validate args', args);

		if (args.type !== TokenType.ACCESS_TOKEN) {
			throw new UnauthorizedException();
		}

		let user: TUser | TAdmin | undefined;

		if (args.userType === EUserType.USER) {
			user = await this.dataServices.users.getById(args.userId);
		} else if (args.userType === EUserType.ADMIN) {
			user = await this.dataServices.admins.getById(args.userId);
		} else {
			throw new UnauthorizedException();
		}

		if (!user?.id) {
			throw new UnauthorizedException();
		}

		return {
			...user,
			userType: args.userType,
		} as unknown as TUser | TAdmin;
	}
}
