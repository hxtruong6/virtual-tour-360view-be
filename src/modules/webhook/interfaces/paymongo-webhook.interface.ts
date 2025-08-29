export interface IPaymongoWebhookBilling {
	address: {
		city: string;
		country: string;
		line1: string;
		line2?: string;
		postal_code: string;
		state: string;
	};
	email: string;
	name: string;
	phone: string;
}

export interface IPaymongoWebhookPaymentSource {
	id: string;
	type: string;
	provider: {
		id: string | null;
	};
	provider_id: string | null;
}

export interface IPaymongoWebhookPaymentAttributes {
	access_url: string | null;
	amount: number;
	balance_transaction_id: string;
	billing: IPaymongoWebhookBilling;
	currency: string;
	description: string;
	disputed: boolean;
	external_reference_number: string;
	fee: number;
	instant_settlement: string | null;
	livemode: boolean;
	net_amount: number;
	origin: string;
	payment_intent_id: string | null;
	payout: string | null;
	source: IPaymongoWebhookPaymentSource;
	statement_descriptor: string;
	status: string;
	tax_amount: number | null;
	metadata: {
		pm_reference_number: string;
	};
	promotion: string | null;
	refunds: unknown[];
	taxes: unknown[];
	available_at: number;
	created_at: number;
	credited_at: number;
	paid_at: number;
	updated_at: number;
}

export interface IPaymongoWebhookPayment {
	data: {
		id: string;
		type: string;
		attributes: IPaymongoWebhookPaymentAttributes;
	};
}

export interface IPaymongoWebhookLinkAttributes {
	amount: number;
	archived: boolean;
	currency: string;
	description: string;
	livemode: boolean;
	fee: number;
	remarks: string;
	status: string;
	tax_amount: number | null;
	taxes: unknown[];
	checkout_url: string;
	reference_number: string;
	created_at: number;
	updated_at: number;
	payments: IPaymongoWebhookPayment[];
}

export interface IPaymongoWebhookLink {
	id: string;
	type: string;
	attributes: IPaymongoWebhookLinkAttributes;
}

export interface IPaymongoWebhookEvent {
	data: {
		id: string;
		type: string;
		attributes: {
			type: string;
			livemode: boolean;
			data: IPaymongoWebhookLink;
			previous_data: Record<string, unknown>;
			created_at: number;
			updated_at: number;
		};
	};
}

export interface IPaymentRemarks {
	bookingId: string;
	paymentHistoryId: string;
	userId: string;
}
