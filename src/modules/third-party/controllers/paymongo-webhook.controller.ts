/* eslint-disable sonarjs/no-duplicate-string */
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EUserType } from '../../../common/constants';
import { Auth } from '../../../decorators/http.decorators';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import {
	IPaymongoWebhookListResponse,
	IPaymongoWebhookResponse,
} from '../interfaces/paymongo-webhook.interface';
import { PaymongoWebhookService } from '../services/paymongo-webhook.service';

@Controller('third-party/paymongo/webhooks')
@ApiTags('Third Party - Paymongo Webhooks')
export class PaymongoWebhookController {
	constructor(private readonly webhookService: PaymongoWebhookService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@Auth({ userTypes: [EUserType.ADMIN] })
	@ApiOperation({ summary: 'Create a new Paymongo webhook' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Webhook created successfully',
		type: Object,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input data',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthorized',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Forbidden - Insufficient permissions',
	})
	async createWebhook(
		@Body() createWebhookDto: CreateWebhookDto,
	): Promise<IPaymongoWebhookResponse> {
		return this.webhookService.createWebhook(
			createWebhookDto.events,
			createWebhookDto.url,
		);
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	@Auth({ userTypes: [EUserType.ADMIN] })
	@ApiOperation({ summary: 'List all Paymongo webhooks' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of webhooks retrieved successfully',
		type: Object,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthorized',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Forbidden - Insufficient permissions',
	})
	async listWebhooks(): Promise<IPaymongoWebhookListResponse> {
		return this.webhookService.listWebhooks();
	}

	@Post(':id/disable')
	@HttpCode(HttpStatus.OK)
	@Auth({ userTypes: [EUserType.ADMIN] })
	@ApiOperation({ summary: 'Disable a Paymongo webhook' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Webhook disabled successfully',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Webhook not found',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthorized',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Forbidden - Insufficient permissions',
	})
	async disableWebhook(@Param('id') id: string): Promise<void> {
		await this.webhookService.disableWebhook(id);
	}

	@Post(':id/enable')
	@HttpCode(HttpStatus.OK)
	@Auth({ userTypes: [EUserType.ADMIN] })
	@ApiOperation({ summary: 'Enable a Paymongo webhook' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Webhook enabled successfully',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Webhook not found',
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthorized',
	})
	@ApiResponse({
		status: HttpStatus.FORBIDDEN,
		description: 'Forbidden - Insufficient permissions',
	})
	async enableWebhook(@Param('id') id: string): Promise<void> {
		await this.webhookService.enableWebhook(id);
	}
}
