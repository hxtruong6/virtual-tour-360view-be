/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';

import { WebhookPaymongoSignatureUtil } from '../../common/utils/webhook-signature.util';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { PaymongoWebhookHandler } from './handlers/paymongo-webhook.handler';
import { IPaymongoWebhookEvent } from './interfaces/paymongo-webhook.interface';

@Injectable()
export class WebhookUseCase {
	private readonly logger = new Logger(WebhookUseCase.name);

	constructor(
		private readonly appConfigService: ApiConfigService,
		private readonly paymongoWebhookHandler: PaymongoWebhookHandler,
	) {}

	// eslint-disable-next-line @typescript-eslint/require-await
	async handlePaymongoWebhook(
		signature: string,
		payload: IPaymongoWebhookEvent,
	): Promise<void> {
		try {
			// Verify webhook signature
			// if (!this.verifyPaymongoSignature(signature, payload)) {
			// 	throw new Error('Invalid webhook signature');
			// }
			// Process the webhook event
			// await this.paymongoWebhookHandler.handle(payload);
		} catch (error) {
			this.logger.error('Error processing Paymongo webhook:', error);

			throw error;
		}
	}

	private verifyPaymongoSignature(
		signature: string,
		payload: IPaymongoWebhookEvent,
	): boolean {
		return WebhookPaymongoSignatureUtil.verifySignature({
			signatureHeader: signature,
			payload: JSON.stringify(payload),
			secretKey: this.appConfigService.paymongoConfig.secretKey,
		});
	}
}
