/* eslint-disable sonarjs/no-duplicate-string */
import { Injectable, Logger } from '@nestjs/common';

import { EPaymongoWebhookEvent } from '../../../common/constants/enums';
import { IDataServices } from '../../../core/abstract';
import {
	IPaymentRemarks,
	IPaymongoWebhookEvent,
} from '../interfaces/paymongo-webhook.interface';

@Injectable()
export class PaymongoWebhookHandler {
	private readonly logger = new Logger(PaymongoWebhookHandler.name);

	constructor(private readonly dataServices: IDataServices) {}

	handle(event: IPaymongoWebhookEvent): void {
		const { type, data } = event.data.attributes;

		// eslint-disable-next-line sonarjs/no-small-switch
		switch (type) {
			case EPaymongoWebhookEvent.LINK_PAYMENT_PAID: {
				this.handleLinkPaymentPaid(data);
				break;
			}

			default: {
				this.logger.warn(`Unhandled webhook event type: ${type}`);
				break;
			}
		}
	}

	private parseRemarks(remarks: string | null): IPaymentRemarks {
		try {
			if (!remarks) {
				throw new Error('Remarks is required');
			}

			const parsed = JSON.parse(remarks) as IPaymentRemarks;

			if (!parsed.bookingId || !parsed.paymentHistoryId || !parsed.userId) {
				throw new Error('Missing required fields in remarks');
			}

			return parsed;
		} catch (error) {
			this.logger.error(`Error parsing remarks: ${JSON.stringify(error)}`);

			throw new Error('Invalid remarks format');
		}
	}

	private handleLinkPaymentPaid(
		source: IPaymongoWebhookEvent['data']['attributes']['data'],
	): void {
		try {
			this.logger.log(
				`Processing payment webhook: ${JSON.stringify({
					linkId: source.id,
					status: source.attributes.status,
				})}`,
			);

			// Extract payment history ID from remarks
			const remarks = this.parseRemarks(source.attributes.remarks);

			this.logger.log(`Parsed remarks: ${JSON.stringify(remarks)}`);
		} catch (error) {
			this.logger.error(
				`Error handling link payment paid: ${JSON.stringify(error)}`,
			);

			throw error;
		}
	}
}
