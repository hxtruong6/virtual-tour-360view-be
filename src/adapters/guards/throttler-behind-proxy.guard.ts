import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
	// eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-explicit-any
	protected async getTracker(req: Record<string, any>): Promise<string> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
		return req.ips.length > 0 ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
	}
}
