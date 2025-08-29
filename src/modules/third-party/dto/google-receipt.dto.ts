import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object representing a Google Play in-app purchase receipt.
 */
export class GoogleReceiptDto {
	@IsString()
	@IsNotEmpty()
	readonly packageName!: string;

	@IsString()
	@IsNotEmpty()
	readonly token!: string;

	@IsString()
	@IsNotEmpty()
	readonly productId!: string;
}
