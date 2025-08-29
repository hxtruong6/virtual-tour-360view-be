import { Global, Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { GrpcAuthGuard } from '../../adapters/guards/grpc-auth.guard';
import { GrpcAuthUserInterceptor } from '../../adapters/interceptors/grpc-auth-user-interceptor.service';
import { DataServicesModule } from '../../infrastructure/data-services/sql/data-services.module';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { SharedModule } from '../../shared/shared.module';
import { CwInventoryUseCase } from '../cwgame/cw-inventory.use-case';
import { GameConfigUseCase } from '../cwgame/game-configs/game-config.use-case';
import { UserModule } from '../user/user.module';
import { UserUseCases } from '../user/user.use-case';
import { AdminAuthController } from './admin-auth.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GrpcJwtStrategy } from './grpc-jwt.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PublicStrategy } from './public.strategy';

@Global()
@Module({
	imports: [
		forwardRef(() => UserModule),
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
		DataServicesModule,
		SharedModule,
		// NotificationModule,
	],
	controllers: [AuthController, AdminAuthController],
	providers: [
		UserUseCases,
		AuthService,
		JwtStrategy,
		GrpcJwtStrategy,
		PublicStrategy,
		GrpcAuthGuard,
		GrpcAuthUserInterceptor,
		CwInventoryUseCase,
		GameConfigUseCase,
	],
	exports: [JwtModule, AuthService, GrpcAuthGuard, GrpcAuthUserInterceptor],
})
export class AuthModule {}
