/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';

import { RequestContextService } from '../../shared/services/request-context.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
	private logger = new Logger('HTTP');

	constructor(private readonly requestContextService: RequestContextService) {}

	use(req: Request, res: Response, next: NextFunction) {
		const requestId = req.headers['x-request-id'] || nanoid();

		this.requestContextService.run(
			() => {
				// set requestId to request object
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				(req as any).requestId = requestId; // eslint-disable-line @typescript-eslint/no-explicit-any

				this.requestContextService.set('requestId', requestId);
				this.requestContextService.set('ipAddress', req.ip);
				this.requestContextService.set('userAgent', req.headers['user-agent']);
				this.requestContextService.set('startTime', Date.now());

				this.logger.log({
					message: `Incoming Request ${requestId}`,
					method: req.method,
					path: req.path,
					originalUrl: req.originalUrl,
					requestId,
					ipAddress: req.ip,
					userAgent: req.get('User-Agent'),
				});

				next();
			},
			{ requestId },
		);

		res.setHeader('x-request-id', requestId);

		res.on('finish', () => {
			const { statusCode } = res;
			// const contentLength = res.get('content-length');
			// const userAgent = req.headers['user-agent'];
			// const ip = req.ip;
			// const method = req.method;
			const originalUrl = req.originalUrl;
			// const httpVersion = req.httpVersion;
			const startTime =
				this.requestContextService.get<number>('startTime') || Date.now();

			// if (statusCode >= 400) {
			// 	this.logger.error({
			// 		message: `Request Error ${requestId}`,
			// 		statusCode,
			// 		requestId,
			// 		timestamp: new Date().toISOString(),
			// 		request: {
			// 			method,
			// 			originalUrl,
			// 			body: req.body,
			// 			query: req.query,
			// 			params: req.params,
			// 		},
			// 	});
			// }

			// this.logger.log(
			// 	// eslint-disable-next-line max-len
			// 	`${ip} [${new Date().toISOString()}] ${method} ${originalUrl} HTTP/${httpVersion} ${statusCode} ${contentLength} ${userAgent}`,
			// );

			this.logger.log({
				message: `Request Processed ${requestId}`,
				originalUrl,
				requestId,
				statusCode,
				responseTime: `${Date.now() - startTime}ms`, // purpose: to support response time
			});
		});
	}
}
