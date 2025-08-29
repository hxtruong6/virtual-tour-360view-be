import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IPaymongoWebhookEvent } from './interfaces/paymongo-webhook.interface';
import { WebhookUseCase } from './webhook.use-case';

@Controller('webhooks')
@ApiTags('webhooks')
export class WebhookController {
	constructor(private readonly webhookService: WebhookUseCase) {}

	@Post('paymongo')
	@ApiOperation({ summary: 'Handle Paymongo webhook events' })
	@ApiResponse({ status: 200, description: 'Webhook processed successfully' })
	async handlePaymongoWebhook(
		@Headers('Paymongo-Signature') signature: string,
		@Body() payload: IPaymongoWebhookEvent,
	): Promise<void> {
		console.info('signature', signature);
		console.info('handlePaymongoWebhook', JSON.stringify(payload, null, 2));

		await this.webhookService.handlePaymongoWebhook(signature, payload);
	}
}
