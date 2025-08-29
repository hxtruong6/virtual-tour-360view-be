import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymongoWebhookException extends HttpException {
	constructor(
		message: string,
		status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
	) {
		super(message, status);
	}
}

export class PaymongoWebhookNotFoundException extends PaymongoWebhookException {
	constructor(webhookId: string) {
		super(`Webhook with ID ${webhookId} not found`, HttpStatus.NOT_FOUND);
	}
}

export class PaymongoWebhookValidationException extends PaymongoWebhookException {
	constructor(message: string) {
		super(message, HttpStatus.BAD_REQUEST);
	}
}

export class PaymongoWebhookApiException extends PaymongoWebhookException {
	constructor(message: string) {
		super(message, HttpStatus.BAD_GATEWAY);
	}
}
