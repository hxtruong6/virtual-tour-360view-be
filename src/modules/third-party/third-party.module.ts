import { IAPModule } from '@jeremybarbet/nest-iap';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ApiConfigService } from '../../shared/services/api-config.service';
import { IapController } from './controllers/iap.controller';
import { PaymongoWebhookController } from './controllers/paymongo-webhook.controller';
import { PaymongoWebhookService } from './services/paymongo-webhook.service';

@Module({
	imports: [
		ConfigModule,
		IAPModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				apple: {
					password: configService.get<string>('APPLE_SHARED_SECRET')!,
				},
				google: {
					clientEmail: configService.get<string>('GOOGLE_CLIENT_EMAIL')!,
					privateKey: configService.get<string>('GOOGLE_PRIVATE_KEY')!,
				},
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [PaymongoWebhookController, IapController],
	providers: [PaymongoWebhookService, ApiConfigService],
	exports: [PaymongoWebhookService],
})
export class ThirdPartyModule {}
