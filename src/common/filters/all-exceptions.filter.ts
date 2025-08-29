/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { TranslationService } from '../../shared/services/translation.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private readonly translationService: TranslationService,
	) {}

	async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
		// Skip gRPC requests - let GrpcExceptionFilter handle them
		if (host.getType() === 'rpc') {
			console.info('[HTTP Filter] gRPC request - skipping');

			throw exception; // Re-throw for gRPC filter to handle
		}

		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const request = ctx.getRequest();

		let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		let message: any = { translateKey: 'common.errors.internal_server_error' };
		let errors: any[] = [];
		let error = 'Something went wrong';

		console.info('xxx001 exception', exception);

		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			// Handle different response formats
			if (typeof exceptionResponse === 'object') {
				const response = exceptionResponse as any;

				// If the exception already contains a translation key
				if (response.translateKey) {
					message = response;
				} else if (response.error === 'Bad Request') {
					message = response.message;
				} else if (response.message) {
					// If it's a validation error or has multiple messages
					message = response?.error || 'Something went wrong';
					errors = response.errors ?? response.message;
				}

				error = response.error;
			} else {
				message = {
					translateKey: 'common.errors.unknown',
					args: { message: exceptionResponse },
				};
			}
		} else if (exception instanceof Error) {
			error = exception.message;

			message =
				(exception as any).translateKey ?
					{
						translateKey: (exception as any).translateKey,
						args: (exception as any).args,
					}
				:	exception.message || 'Something went wrong';
		}

		// Translate the message
		const translatedMessage = await this.translationService.translateMessage({
			message,
			error,
		});

		this.logError(exception, request, statusCode);

		// Send the response and DON'T throw the exception again
		httpAdapter.reply(
			ctx.getResponse(),
			{
				...translatedMessage,
				...(errors.length > 0 && { errors }),
			},
			statusCode,
		);
	}

	private logError(exception: unknown, request: any, statusCode: number) {
		const requestId = request.requestId;
		const timestamp = new Date().toISOString();

		// Enhanced error details with better categorization
		const errorDetails: any = {
			message: `Request Error ${requestId}`,
			requestId,
			timestamp,
			statusCode,
			errorType: this.getErrorType(exception),
			request: {
				method: request.method,
				originalUrl: request.originalUrl,
				url: request.url,
				path: request.route?.path,
				headers: this.sanitizeHeaders(request.headers),
				userAgent: request.headers['user-agent'],
				ip: this.getClientIp(request),
				body: this.sanitizeBody(request.body),
				query: request.query,
				params: request.params,
				user:
					request.user ?
						{
							id: request.user.id,
							userType: request.user.userType,
							// Don't log sensitive user info
						}
					:	null,
			},
			environment: process.env.NODE_ENV || 'development',
		};

		// Add detailed error information with better structure
		if (exception instanceof Error) {
			errorDetails.error = {
				name: exception.name,
				message: exception.message,
				stack: exception.stack,
				// Include any additional properties from the error
				...(exception as any),
			};

			// Special handling for common error types
			if (
				exception.name === 'TypeError' &&
				exception.message.includes('constructor')
			) {
				errorDetails.error.category = 'DTO_VALIDATION_ERROR';
				errorDetails.error.suggestion =
					'Check if DTO class is properly decorated with class-validator decorators';
			} else if (exception.name === 'ValidationError') {
				errorDetails.error.category = 'VALIDATION_ERROR';
			} else if (exception.name === 'QueryFailedError') {
				errorDetails.error.category = 'DATABASE_ERROR';
			}
		} else {
			errorDetails.error = {
				message: String(exception),
				type: typeof exception,
				category: 'UNKNOWN_ERROR',
			};
		}

		// Log with appropriate level based on error type
		if (statusCode >= 500) {
			this.logger.error(errorDetails);
		} else if (statusCode >= 400) {
			this.logger.warn(errorDetails);
		} else {
			this.logger.log(errorDetails);
		}
	}

	private getErrorType(exception: unknown): string {
		if (exception instanceof HttpException) {
			return 'HTTP_EXCEPTION';
		} else if (exception instanceof Error) {
			return exception.constructor.name;
		}

		return 'UNKNOWN';
	}

	private sanitizeHeaders(headers: any): any {
		const sanitized = { ...headers };

		// Remove sensitive headers
		delete sanitized.authorization;
		delete sanitized.cookie;
		delete sanitized['x-api-key'];

		return sanitized;
	}

	private sanitizeBody(body: any): any {
		if (!body) {
			return body;
		}

		const sanitized = { ...body };

		// Remove sensitive fields
		delete sanitized.password;
		delete sanitized.token;
		delete sanitized.secret;
		delete sanitized.apiKey;

		return sanitized;
	}

	private getClientIp(request: any): string {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return (
			request.headers['x-forwarded-for'] ||
			request.headers['x-real-ip'] ||
			request.connection?.remoteAddress ||
			request.socket?.remoteAddress ||
			request.ip ||
			'unknown'
		);
	}
}
