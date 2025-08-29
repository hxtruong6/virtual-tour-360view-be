import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EUserType, TokenType } from '../../common/constants';
import { validateHash } from '../../common/utils';
import { UserRole, UserStatus } from '../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { RequestAdminLoginDto } from './dto/admin-auth.request.dto';
import { ResponseAdminDto } from './dto/auth.common.dto';
import { LoginPayloadDto } from './dto/login-payload.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ApiConfigService,
		private readonly prisma: PrismaService,
	) {}

	async createAccessToken(data: {
		userId: string;
		username: string;
		userType: EUserType;
		tokenType?: TokenType;
	}): Promise<TokenPayloadDto> {
		return new TokenPayloadDto({
			expiresIn: this.configService.authConfig.jwtExpirationTime,
			accessToken: await this.jwtService.signAsync({
				userId: data.userId,
				type: data.tokenType ?? TokenType.ACCESS_TOKEN,
				username: data.username,
				userType: data.userType,
			}),
			refreshToken: await this.jwtService.signAsync({
				userId: data.userId,
				username: data.username,
				type: TokenType.REFRESH_TOKEN,
				userType: data.userType,
			}),
		});
	}

	async adminLogin(data: RequestAdminLoginDto): Promise<LoginPayloadDto> {
		// Get admin user from Prisma by username or email
		const adminUser = await this.prisma.user.findFirst({
			where: {
				OR: [
					{ username: data.username },
					{ email: data.username }, // Allow login with email as username
				],
				role: {
					in: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
				},
				status: UserStatus.ACTIVE,
				deletedAt: null,
			},
		});

		if (!adminUser) {
			throw new UnauthorizedException(
				'Invalid username or admin access denied',
			);
		}

		// Validate password
		const isPasswordValid = await validateHash(
			data.password,
			adminUser.hashedPassword,
		);

		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password');
		}

		// Update last login
		await this.prisma.user.update({
			where: { id: adminUser.id },
			data: {
				lastLoginAt: new Date(),
			},
		});

		// Create access token
		const token = await this.createAccessToken({
			userId: adminUser.id,
			username: adminUser.username!,
			userType: EUserType.ADMIN,
			tokenType: TokenType.ACCESS_TOKEN,
		});

		// Convert Prisma user to ResponseAdminDto format
		const adminDto = new ResponseAdminDto(adminUser);

		return new LoginPayloadDto(adminDto, token);
	}

	async getAdminProfile(adminId: string): Promise<ResponseAdminDto> {
		const adminUser = await this.prisma.user.findFirst({
			where: {
				id: adminId,
				role: {
					in: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
				},
				status: UserStatus.ACTIVE,
				deletedAt: null,
			},
		});

		if (!adminUser) {
			throw new UnauthorizedException('Admin not found or inactive');
		}

		return new ResponseAdminDto(adminUser);
	}
}
