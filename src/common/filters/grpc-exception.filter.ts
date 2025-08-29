/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

import { GrpcStatus, HTTP_TO_GRPC_STATUS_MAP } from '../constants';
import { GrpcException } from '../exceptions/grpc.exception';
import {
	CommonResponse,
	Error as ProtoError,
	Status,
} from '../types/proto/cwgame_api';
import { grpcResponse } from '../utils';

@Catch(GrpcException, RpcException, Error)
export class GrpcExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GrpcExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost): Observable<CommonResponse> {
		const rpcHost = host.switchToRpc();
		const context = rpcHost.getContext();
		const data = rpcHost.getData();

		console.info('xxx001 GrpcExceptionFilter', exception, context, data);

		// Log the error with context
		this.logError(exception, context, data);

		// Convert exception to gRPC response
		const exceptionResponse = this.convertExceptionToGrpcResponse(exception);

		return throwError(() => exceptionResponse);
	}

	private convertExceptionToGrpcResponse(exception: unknown): CommonResponse {
		let status: Status;
		let error: ProtoError;

		// Check if it's our custom GrpcException
		if (exception instanceof GrpcException) {
			const grpcError = exception.getError();
			const grpcCode = this.mapToGrpcStatus(grpcError.status);

			status = {
				code: grpcCode,
				message: grpcError.message,
				isSuccess: false,
			};

			error = {
				code: grpcError.code,
				message: grpcError.message,
				timestamp: new Date(),
			};
		} else if (this.isRpcException(exception)) {
			// Handle RPC-like exceptions
			const rpcError = exception.getError() as any;
			const grpcCode = this.mapToGrpcStatus(Number(rpcError?.status) || 500);

			status = {
				code: grpcCode,
				message: rpcError?.message || 'RPC Error',
				isSuccess: false,
			};

			error = {
				code: rpcError?.code || 'RPC_ERROR',
				message: rpcError?.message || 'An RPC error occurred',
				timestamp: new Date(),
			};
		} else if (this.isError(exception)) {
			// Handle standard Error objects
			const grpcCode = GrpcStatus.INTERNAL;

			status = {
				code: grpcCode,
				message: 'Internal server error',
				isSuccess: false,
			};

			error = {
				code: 'INTERNAL_ERROR',
				message: exception.message || 'An internal error occurred',
				timestamp: new Date(),
			};
		} else {
			// Handle unknown exceptions
			status = {
				code: GrpcStatus.UNKNOWN,
				message: 'Unknown error occurred',
				isSuccess: false,
			};

			error = {
				code: 'UNKNOWN_ERROR',
				message: String(exception),
				timestamp: new Date(),
			};
		}

		return grpcResponse({
			status,
			error,
			data: undefined,
			metadata: {
				requestId: this.generateRequestId(),
				timestamp: new Date(),
				version: '1.0.0',
			},
		});
	}

	private isRpcException(
		exception: unknown,
	): exception is { getError(): unknown } {
		return (
			typeof exception === 'object' &&
			exception !== null &&
			'getError' in exception &&
			typeof (exception as any).getError === 'function'
		);
	}

	private isError(exception: unknown): exception is Error {
		return (
			typeof exception === 'object' &&
			exception !== null &&
			'message' in exception
		);
	}

	private mapToGrpcStatus(httpStatus: number): GrpcStatus {
		return HTTP_TO_GRPC_STATUS_MAP.get(httpStatus) || GrpcStatus.INTERNAL;
	}

	private logError(exception: unknown, context: any, data: any): void {
		console.info('xxx001 logError', exception, context, data);

		const errorDetails: any = {
			message: 'gRPC Request Error',
			timestamp: new Date().toISOString(),
			context: {
				service: context?.service,
				method: context?.method,
				metadata: context?.metadata,
			},
			requestData: data,
		};

		// Add detailed error information
		if (exception instanceof GrpcException) {
			const grpcError = exception.getError();
			errorDetails.error = {
				type: 'GrpcException',
				status: grpcError.status,
				message: grpcError.message,
				code: grpcError.code,
				details: grpcError.details,
			};
		} else if (this.isError(exception)) {
			errorDetails.error = {
				name: (exception as any).name,
				message: exception.message,
				stack: (exception as any).stack,
				// Include any additional properties from the error
				...(exception as any),
			};
		} else if (this.isRpcException(exception)) {
			const rpcError = exception.getError() as any;
			errorDetails.error = {
				type: 'RpcException',
				status: rpcError?.status,
				message: rpcError?.message,
				code: rpcError?.code,
			};
		} else {
			errorDetails.error = {
				message: String(exception),
				type: typeof exception,
			};
		}

		this.logger.error(errorDetails);
	}

	private generateRequestId(): string {
		return `grpc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
	}
}
