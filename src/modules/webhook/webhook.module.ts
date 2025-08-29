import { Module } from '@nestjs/common';

import { DataServicesModule } from '../../infrastructure/data-services/sql/data-services.module';
import { SharedModule } from '../../shared/shared.module';
import { PaymongoWebhookHandler } from './handlers/paymongo-webhook.handler';
import { WebhookController } from './webhook.controller';
import { WebhookUseCase } from './webhook.use-case';

@Module({
	imports: [SharedModule, DataServicesModule],
	controllers: [WebhookController],
	providers: [WebhookUseCase, PaymongoWebhookHandler],
	exports: [WebhookUseCase],
})
export class WebhookModule {}
