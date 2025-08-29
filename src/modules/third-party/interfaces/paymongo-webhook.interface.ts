export interface IPaymongoWebhookAttributes {
	events: string[];
	livemode: boolean;
	secret_key: string;
	status: 'enabled' | 'disabled';
	url: string;
	created_at: number;
	updated_at: number;
}

export interface IPaymongoWebhook {
	id: string;
	type: string;
	attributes: IPaymongoWebhookAttributes;
}

export interface IPaymongoWebhookResponse {
	data: IPaymongoWebhook;
}

export interface IPaymongoWebhookListResponse {
	data: IPaymongoWebhook[];
}

export interface IPaymongoWebhookCreateRequest {
	data: {
		attributes: {
			events: string[];
			url: string;
		};
	};
}
