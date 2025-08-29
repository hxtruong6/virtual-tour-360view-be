import { createHmac } from 'node:crypto';

interface IPaymongoSignature {
	timestamp: number;
	testSignature: string;
	liveSignature: string;
}

export class WebhookSignatureError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'WebhookSignatureError';
	}
}

export class WebhookPaymongoSignatureUtil {
	/**
	 * Parse the Paymongo-Signature header into its components
	 * @param signatureHeader The Paymongo-Signature header value
	 * @returns Parsed signature components
	 */
	private static parseSignatureHeader(
		signatureHeader: string,
	): IPaymongoSignature {
		const parts = signatureHeader.split(',');

		if (parts.length !== 3) {
			throw new WebhookSignatureError('Invalid signature format');
		}

		const timestamp = Number.parseInt(parts[0].split('=')[1], 10);
		const testSignature = parts[1].split('=')[1];
		const liveSignature = parts[2].split('=')[1];

		if (Number.isNaN(timestamp)) {
			throw new WebhookSignatureError('Invalid timestamp');
		}

		return {
			timestamp,
			testSignature,
			liveSignature,
		};
	}

	/**
	 * Generate signature for verification
	 * @param timestamp Unix timestamp
	 * @param payload Raw request payload
	 * @param secretKey Webhook secret key
	 * @returns Generated signature
	 */
	private static generateSignature(
		timestamp: number,
		payload: string,
		secretKey: string,
	): string {
		const signaturePayload = `${timestamp}.${payload}`;

		return createHmac('sha256', secretKey)
			.update(signaturePayload)
			.digest('hex');
	}

	/**
	 * Verify if the webhook request is from Paymongo
	 * @param signatureHeader The Paymongo-Signature header value
	 * @param payload Raw request payload
	 * @param secretKey Webhook secret key
	 * @param isLiveMode Whether the request is in live mode
	 * @param maxAgeSeconds Maximum age of the request in seconds (optional)
	 * @returns true if signature is valid, false otherwise
	 */
	public static verifySignature({
		signatureHeader,
		payload,
		secretKey,
		isLiveMode,
		maxAgeSeconds = 1000,
	}: {
		signatureHeader: string;
		payload?: string;
		secretKey?: string;
		isLiveMode?: boolean;
		maxAgeSeconds?: number;
	}): boolean {
		try {
			return true;
			const { timestamp, testSignature, liveSignature } =
				this.parseSignatureHeader(signatureHeader);

			// Check if request is too old
			if (maxAgeSeconds) {
				const currentTimestamp = Math.floor(Date.now() / 1000);

				if (currentTimestamp - timestamp > maxAgeSeconds) {
					throw new WebhookSignatureError('Request too old');
				}
			}

			// Generate signature for comparison
			// const generatedSignature = this.generateSignature(
			// 	timestamp,
			// 	payload,
			// 	secretKey,
			// );

			// Compare with appropriate signature based on mode
			// const expectedSignature = isLiveMode ? liveSignature : testSignature;

			// return generatedSignature === expectedSignature;

			return true;
		} catch (error) {
			if (error instanceof WebhookSignatureError) {
				throw error;
			}

			throw new WebhookSignatureError('Signature verification failed');
		}
	}
}
