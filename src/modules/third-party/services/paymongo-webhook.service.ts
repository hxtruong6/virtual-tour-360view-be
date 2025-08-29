/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, type AxiosInstance } from 'axios';

import { EPaymongoWebhookEvent } from '../../../common/constants/enums';
import { ApiConfigService } from '../../../shared/services/api-config.service';
import {
	PaymongoWebhookApiException,
	PaymongoWebhookNotFoundException,
	PaymongoWebhookValidationException,
} from '../exceptions/paymongo-webhook.exception';
import {
	IPaymongoWebhookCreateRequest,
	IPaymongoWebhookListResponse,
	IPaymongoWebhookResponse,
} from '../interfaces/paymongo-webhook.interface';

@Injectable()
export class PaymongoWebhookService {
	private readonly logger = new Logger(PaymongoWebhookService.name);

	private readonly baseUrl = 'https://api.paymongo.com/v1';

	private readonly axiosInstance: AxiosInstance;

	private readonly validEvents = [EPaymongoWebhookEvent.LINK_PAYMENT_PAID];

	constructor(private readonly configService: ApiConfigService) {
		this.axiosInstance = axios.create({
			baseURL: this.baseUrl + '/webhooks',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		// Add request interceptor to add auth header
		this.axiosInstance.interceptors.request.use((config) => {
			config.headers.Authorization = this.getAuthHeader();

			return config;
		});

		// Add response interceptor for error handling
		this.axiosInstance.interceptors.response.use(
			(response) => response,
			(error) => {
				if (axios.isAxiosError(error)) {
					this.handleAxiosError(error);
				}

				throw error;
			},
		);
	}

	private getAuthHeader(): string {
		const secretKey = this.configService.paymongoConfig.secretKey;

		if (!secretKey) {
			throw new PaymongoWebhookValidationException(
				'Paymongo secret key is not configured',
			);
		}

		return `Basic ${Buffer.from(secretKey + ':').toString('base64')}`;
	}

	private validateEvents(events: EPaymongoWebhookEvent[]): void {
		const invalidEvents = events.filter(
			(event) => !this.validEvents.includes(event),
		);

		if (invalidEvents.length > 0) {
			throw new PaymongoWebhookValidationException(
				`Invalid events: ${invalidEvents.join(', ')}. Valid events are: ${this.validEvents.join(', ')}`,
			);
		}
	}

	private handleAxiosError(error: AxiosError): never {
		this.logger.error('Paymongo API error:', {
			status: error.response?.status,
			data: error.response?.data,
			message: error.message,
		});

		if (error.response?.status === 404) {
			throw new PaymongoWebhookNotFoundException('Webhook not found');
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
		if ((error.response?.data as any)?.errors?.[0]?.detail) {
			throw new PaymongoWebhookApiException(
				// eslint-disable-next-line max-len
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
				(error.response?.data as any).errors[0].detail,
			);
		}

		throw new PaymongoWebhookApiException(
			'Failed to communicate with Paymongo API',
		);
	}

	async createWebhook(
		events: EPaymongoWebhookEvent[],
		url: string,
	): Promise<IPaymongoWebhookResponse> {
		this.validateEvents(events);

		const { data } = await this.axiosInstance.post<IPaymongoWebhookResponse>(
			'/',
			{
				data: { attributes: { events, url } },
			} as IPaymongoWebhookCreateRequest,
		);

		return data;
	}

	async listWebhooks(): Promise<IPaymongoWebhookListResponse> {
		const { data } =
			await this.axiosInstance.get<IPaymongoWebhookListResponse>('/');

		return data;
	}

	async disableWebhook(webhookId: string): Promise<void> {
		await this.axiosInstance.post(`/${webhookId}/disable`);
	}

	async enableWebhook(webhookId: string): Promise<void> {
		await this.axiosInstance.post(`/${webhookId}/enable`);
	}
}
