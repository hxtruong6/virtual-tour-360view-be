import { IAPService } from '@jeremybarbet/nest-iap';
import {
	Body,
	Controller,
	HttpException,
	HttpStatus,
	Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppleReceiptDto } from '../dto/apple-receipt.dto';
import { GoogleReceiptDto } from '../dto/google-receipt.dto';

interface IVerificationResponse {
	success: boolean;
	message: string;
	data: unknown;
}

interface IAppleVerifyResponse {
	response: {
		status: number;
		[key: string]: unknown;
	};
}

interface IGoogleVerifyResponse {
	response: {
		purchaseState: number;
		[key: string]: unknown;
	};
}

/**
 * Controller responsible for verifying in-app purchases with Apple and Google.
 *
 * The endpoints are intended to be called from the mobile application immediately
 * after a successful purchase. Business logic such as updating user records
 * should be implemented where the TODO comments are located.
 */
@Controller('third-party/iap')
@ApiTags('Third Party - In-App Purchases')
export class IapController {
	constructor(private readonly iapService: IAPService) {}

	@Post('verify-apple')
	@ApiOperation({ summary: 'Verify an Apple in-app purchase receipt' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Receipt verified' })
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Receipt is invalid or could not be verified',
	})
	async verifyApple(
		@Body() body: AppleReceiptDto,
	): Promise<IVerificationResponse> {
		const verification = (await this.iapService.verifyAppleReceipt({
			transactionReceipt: body.transactionReceipt,
		})) as unknown as IAppleVerifyResponse;
		console.info('xxx401 verification', verification);
		const { response } = verification;

		// TODO: Persist purchase information (e.g., update user premium status)

		if (response.status === 0) {
			return {
				success: true,
				message: 'Apple purchase verified',
				data: response,
			};
		}

		throw new HttpException('Invalid Apple receipt', HttpStatus.BAD_REQUEST);
	}

	@Post('verify-google')
	@ApiOperation({ summary: 'Verify a Google Play purchase' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Purchase verified' })
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Purchase is invalid or could not be verified',
	})
	async verifyGoogle(
		@Body() body: GoogleReceiptDto,
	): Promise<IVerificationResponse> {
		const verification = (await this.iapService.verifyGoogleReceipt({
			packageName: body.packageName,
			token: body.token,
			productId: body.productId,
		})) as unknown as IGoogleVerifyResponse;
		console.info('xxx402 verification', verification);
		const { response } = verification;

		// TODO: Persist purchase information (e.g., update user premium status)

		if (response.purchaseState === 0) {
			return {
				success: true,
				message: 'Google purchase verified',
				data: response,
			};
		}

		throw new HttpException('Invalid Google purchase', HttpStatus.BAD_REQUEST);
	}
}
