import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object representing an Apple in-app purchase receipt.
 */
export class AppleReceiptDto {
	@IsString()
	@IsNotEmpty()
	readonly transactionReceipt!: string;
}
