/* eslint-disable sonarjs/no-duplicate-string */
import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

import {
	EAccountStatus,
	EUserType,
	GrpcStatus,
	TokenType,
} from '../../common/constants';
import { GrpcException } from '../../common/exceptions/grpc.exception';
import {
	AuthenticateAccountRequest,
	AuthenticateAccountResponse,
	CommonResponse,
	RegisterAccountRequest,
} from '../../common/types/proto/cwgame_api';
import {
	convertToStruct,
	generateHash,
	grpcResponse,
	validateHash,
} from '../../common/utils';
import { IDataServices } from '../../core/abstract';
import { TUser } from '../../core/entities/user.entity';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { CwInventoryUseCase } from '../cwgame/cw-inventory.use-case';
import { RequestAdminLoginDto } from './dto/admin-auth.request.dto';
import { ResponseAdminDto, ResponseUserDto } from './dto/auth.common.dto';
import {
	RequestUserLoginDto,
	RequestUserRegisterDto,
	RequestWalletAddressLoginDto,
} from './dto/auth.request.dto';
import { RegisterUserResponseDto } from './dto/auth.response.dto';
import { LoginPayloadDto } from './dto/login-payload.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

@Injectable()
export class AuthService {
	private readonly responseMessages = {
		INVALID_PASSWORD: 'Invalid password',
		INVALID_USERNAME_OR_EMAIL: 'Invalid username or email',
	};

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ApiConfigService,
		private readonly dataServices: IDataServices,
		private readonly cwInventoryUseCase: CwInventoryUseCase,
	) {}

	async createAccessToken(data: {
		userId: Uuid;
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

	async validateUser(userLoginDto: RequestUserLoginDto): Promise<{
		id: Uuid;
		username: string;
		passwordHash: string;
		accountStatus: EAccountStatus;
		walletAddress?: string;
	}> {
		if (!userLoginDto.username && !userLoginDto.email) {
			throw new BadRequestException('Username or email is required');
		}

		const user =
			userLoginDto.username ?
				await this.dataServices.users.getByUsername(userLoginDto.username, {
					select: [
						'id',
						'username',
						'passwordHash',
						'accountStatus',
						'walletAddress',
					],
				})
			:	await this.dataServices.users.getByEmail(userLoginDto.email!, {
					select: [
						'id',
						'username',
						'passwordHash',
						'accountStatus',
						'walletAddress',
					],
				});

		if (!user) {
			throw new UnauthorizedException(
				this.responseMessages.INVALID_USERNAME_OR_EMAIL,
			);
		}

		const isPasswordValid = await validateHash(
			userLoginDto.password,
			user.passwordHash,
		);

		if (!isPasswordValid) {
			await this.dataServices.users.update(user.id, {
				loginAttempts: (user.loginAttempts ?? 0) + 1,
				lastFailedLoginAt: new Date(),
			});

			throw new UnauthorizedException(this.responseMessages.INVALID_PASSWORD);
		}

		return user as never;
	}

	//register account
	async registerAccount(data: RegisterAccountRequest): Promise<CommonResponse> {
		try {
			data = {
				...data,
				email: data.email?.toLowerCase(),
				username: data.username.toLowerCase(),
			};

			// Validate input
			if (!data.username || !data.password) {
				throw GrpcException.invalidArgument(
					'Username and password are required',
				);
			}

			const existingUser = await this.dataServices.users.getByUsername(
				data.username,
			);

			if (existingUser) {
				throw GrpcException.alreadyExists(
					'User with this username already exists',
				);
			}

			const pwHash = generateHash(data.password);

			const user = await this.dataServices.users.create({
				username: data.username,
				passwordHash: pwHash,
				nkAccountId: data.nkAccountId,
				level: 1,
				experiencePoints: 0,
				accountStatus: EAccountStatus.ACTIVE,
				createdAt: new Date(),
				updatedAt: new Date(),
				email: data.email,
				phoneNumber: data.phoneNumber,
				displayName: data.displayName,
			});

			await Promise.all([
				this.dataServices.users.initUserWallets(user.id),
				this.cwInventoryUseCase.initUserInventory(user.id),
			]);

			return grpcResponse({
				status: {
					code: GrpcStatus.OK,
					message: 'Account registered successfully',
					isSuccess: true,
				},
				data: convertToStruct(user),
			});
		} catch (error) {
			// If it's already a GrpcException, re-throw it
			if (error instanceof GrpcException) {
				throw error;
			}

			// Log the unexpected error
			console.error('Unexpected error in registerAccount:', error);

			// Convert to internal error
			throw GrpcException.internal('Failed to register account');
		}
	}

	async authenticateAccount(
		data: AuthenticateAccountRequest,
	): Promise<AuthenticateAccountResponse> {
		console.info('xxx002 authenticateAccount', data);

		let user = await this.dataServices.users.getByUsername(data.username);

		console.info('xxx002 user', user);

		if (!user) {
			// throw GrpcException.notFound('User not found');
			return grpcResponse({
				status: {
					code: GrpcStatus.NOT_FOUND,
					message: 'User not found',
					isSuccess: false,
				},
				error: {
					code: 'USER_NOT_FOUND',
					message: 'User not found',
					timestamp: new Date(),
				},
			}) as AuthenticateAccountResponse;
		}

		const isPasswordValid = await validateHash(
			data.password,
			user.passwordHash,
		);

		if (!isPasswordValid) {
			throw new RpcException({
				code: GrpcStatus.UNAUTHENTICATED,
				message: this.responseMessages.INVALID_PASSWORD,
			});
		}

		// init user wallets if not exist
		await Promise.all([
			this.dataServices.users.initUserWallets(user.id),
			this.cwInventoryUseCase.initUserInventory(user.id),
		]);

		user = (await this.dataServices.users.updateByUsername(
			data.username,
			{
				// Only update nkAccountId if it's not already set
				...(data.nkAccountId && !user.nkAccountId ?
					{ nkAccountId: data.nkAccountId }
				:	{}),
				lastLogin: new Date(),
			},
			{ isReturn: true },
		)) as unknown as TUser;

		const expiresIn = this.configService.authConfig.jwtExpirationTime;

		const accessToken = await this.jwtService.signAsync(
			{
				userId: user.id,
				username: user.username,
				type: TokenType.ACCESS_TOKEN,
				userType: EUserType.USER,
			},
			{
				secret: this.configService.authConfig.secret,
				expiresIn,
			},
		);

		const refreshToken = await this.jwtService.signAsync(
			{
				userId: user.id,
				username: user.username,
				type: TokenType.REFRESH_TOKEN,
				userType: EUserType.USER,
			},
			{
				secret: this.configService.authConfig.secret,
				expiresIn: this.configService.authConfig.refreshTokenExpirationTime,
			},
		);

		await Promise.all([
			this.dataServices.users.initUserWallets(user.id),
			this.cwInventoryUseCase.initUserInventory(user.id),
		]);

		return grpcResponse({
			status: {
				code: GrpcStatus.OK,
				message: 'Account authenticated successfully',
				isSuccess: true,
			},
			data: {
				user,
				accessToken,
				refreshToken,
				expiresIn,
			},
		}) as AuthenticateAccountResponse;
	}

	async login(data: RequestUserLoginDto): Promise<LoginPayloadDto> {
		const user = await this.validateUser(data);

		// throw if wallet address is equal to user.walletAddress
		if (data.walletAddress && user.walletAddress !== data.walletAddress) {
			throw new BadRequestException('Wallet address is not correct');
		}

		// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
		const [_, token] = await Promise.all([
			this.dataServices.users.update(user.id, {
				lastLogin: new Date(),
				loginAttempts: 0,
				lastFailedLoginAt: null,
			}),
			this.createAccessToken({
				userId: user.id,
				username: user.username,
				userType: EUserType.USER,
				tokenType: TokenType.ACCESS_TOKEN,
			}),
		]);

		if (user.accountStatus === EAccountStatus.DEACTIVATED) {
			throw new BadRequestException('Account is deactivated');
		}

		await Promise.all([
			this.dataServices.users.initUserWallets(user.id),
			this.cwInventoryUseCase.initUserInventory(user.id),
			// update wallet address if provided
			...(data.walletAddress && !user.walletAddress ?
				[
					this.dataServices.users.update(user.id, {
						walletAddress: data.walletAddress,
					}),
				]
			:	[]),
		]);

		const detailUser = await this.dataServices.users.getById(user.id);

		return new LoginPayloadDto(new ResponseUserDto(detailUser!), token);
	}

	async loginWalletAddress(
		data: RequestWalletAddressLoginDto,
	): Promise<LoginPayloadDto> {
		const user = await this.dataServices.users.getByWalletAddress(
			data.walletAddress,
		);

		if (!user || !user.id) {
			throw new BadRequestException('User not found');
		}

		// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
		const [_, token] = await Promise.all([
			this.dataServices.users.update(user.id, {
				lastLogin: new Date(),
				loginAttempts: 0,
				lastFailedLoginAt: null,
			}),
			this.createAccessToken({
				userId: user.id as Uuid,
				username: user.username,
				userType: EUserType.USER,
				tokenType: TokenType.ACCESS_TOKEN,
			}),
		]);

		if (user.accountStatus === EAccountStatus.DEACTIVATED) {
			throw new BadRequestException('Account is deactivated');
		}

		await Promise.all([
			this.dataServices.users.initUserWallets(user.id),
			this.cwInventoryUseCase.initUserInventory(user.id),
		]);

		const detailUser = await this.dataServices.users.getById(user.id);

		return new LoginPayloadDto(new ResponseUserDto(detailUser!), token);
	}

	async registerMarketplaceAccount(
		data: RequestUserRegisterDto,
	): Promise<RegisterUserResponseDto> {
		const existingUser = await this.dataServices.users.getByUsername(
			data.username,
		);

		console.info(
			'xxx002 registerMarketplaceAccount existingUser',
			existingUser,
		);

		if (existingUser) {
			throw new BadRequestException('User with this username already exists');
		}

		const user = await this.dataServices.users.create({
			...data,
			accountStatus: EAccountStatus.ACTIVE,
			passwordHash: generateHash(data.password),
			level: 1,
			experiencePoints: 0,
			createdAt: new Date(),
		});

		await Promise.all([
			this.dataServices.users.initUserWallets(user.id),
			this.cwInventoryUseCase.initUserInventory(user.id),
		]);

		return new RegisterUserResponseDto(new ResponseUserDto(user));
	}

	async adminLogin(data: RequestAdminLoginDto): Promise<LoginPayloadDto> {
		// Get admin by username
		const admin = await this.dataServices.admins.getByUsername(data.username);

		if (!admin || !admin.isActive) {
			throw new UnauthorizedException(
				'Invalid username or admin access denied',
			);
		}

		// Validate password
		const isPasswordValid = await validateHash(
			data.password,
			admin.passwordHash,
		);

		if (!isPasswordValid) {
			// Update failed login attempts
			await this.dataServices.admins.update(admin.id, {
				loginAttempts: (admin.loginAttempts || 0) + 1,
				lastFailedLoginAt: new Date(),
			});

			throw new UnauthorizedException('Invalid password');
		}

		// Update admin login info
		await this.dataServices.admins.update(admin.id, {
			lastLoginAt: new Date(),
			loginAttempts: 0,
			lastFailedLoginAt: undefined,
		});

		// Create access token
		const token = await this.createAccessToken({
			userId: admin.id as Uuid,
			username: admin.username,
			userType: EUserType.ADMIN,
			tokenType: TokenType.ACCESS_TOKEN,
		});

		return new LoginPayloadDto(new ResponseAdminDto(admin), token);
	}

	async getAdminProfile(adminId: string): Promise<ResponseAdminDto> {
		const admin = await this.dataServices.admins.getById(adminId);

		if (!admin || !admin.isActive) {
			throw new UnauthorizedException('Admin not found or inactive');
		}

		return new ResponseAdminDto(admin);
	}

	async getUserProfile(userId: string): Promise<ResponseUserDto> {
		const user = await this.dataServices.users.getById(userId);

		if (!user || user.accountStatus === EAccountStatus.DEACTIVATED) {
			throw new UnauthorizedException('User not found or inactive');
		}

		return new ResponseUserDto(user);
	}
}
