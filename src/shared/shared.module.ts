import { Global, Module, type Provider } from '@nestjs/common';

import { ApiConfigService } from './services/api-config.service';
import { GeneratorService } from './services/generator.service';
import { LocalStorageService } from './services/local-storage.service';
import { RequestContextService } from './services/request-context.service';
import { TranslationService } from './services/translation.service';
import { ValidatorService } from './services/validator.service';

const providers: Provider[] = [
	ApiConfigService,
	ValidatorService,
	// AwsS3Service,
	GeneratorService,
	TranslationService,
	// SMSService,
	// EmailService,
	RequestContextService,
	LocalStorageService,
	// CacheService,
	// GcloudStorageService,
];

@Global()
@Module({
	providers,
	imports: [
		// CqrsModule,
		// TwilioModule.forRootAsync({
		// 	useFactory: (configService: ApiConfigService) => ({
		// 		accountSid: configService.twilioConfig.accountSid,
		// 		authToken: configService.twilioConfig.authToken,
		// 	}),
		// 	// imports: [],
		// 	inject: [ApiConfigService],
		// }),
		// CacheModule,
	],
	exports: [
		...providers,
		// CqrsModule
	],
})
export class SharedModule {}
