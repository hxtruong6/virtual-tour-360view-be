import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '../../prisma/prisma.module';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { SharedModule } from '../../shared/shared.module';
import { AdminAuthController } from './admin-auth.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PublicStrategy } from './public.strategy';

@Global()
@Module({
	imports: [
		// forwardRef(() => UserModule),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			useFactory: (configService: ApiConfigService) => ({
				// privateKey: configService.authConfig.privateKey,
				// publicKey: configService.authConfig.publicKey,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				secret: configService.authConfig.secret,
				signOptions: {
					// algorithm: 'RS256',
					algorithm: 'HS256',
					// if you want to use token with expiration date
					expiresIn: configService.authConfig.jwtExpirationTime,
				},
				verifyOptions: {
					// algorithms: ['RS256'],
					algorithms: ['HS256'],
				},
			}),
			inject: [ApiConfigService],
		}),
		PrismaModule,
		SharedModule,
		// NotificationModule,
	],
	controllers: [AuthController, AdminAuthController],
	providers: [
		// UserUseCases,
		AuthService,
		JwtStrategy,
		// GrpcJwtStrategy,
		PublicStrategy,
		// GrpcAuthGuard,
		// GrpcAuthUserInterceptor,
		// CwInventoryUseCase,
		// GameConfigUseCase,
	],
	exports: [JwtModule, AuthService],
})
export class AuthModule {}
