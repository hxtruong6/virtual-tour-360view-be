import { GrpcStatus } from '../constants';

export interface IGrpcExceptionError {
	code: string;
	message: string;
	status: number;
	details?: Record<string, unknown>;
}

export class GrpcException {
	private readonly error: IGrpcExceptionError;

	constructor(error: IGrpcExceptionError) {
		this.error = error;
	}

	getError(): IGrpcExceptionError {
		return this.error;
	}

	// Convenience methods for common gRPC errors
	static notFound(message: string, code = 'NOT_FOUND'): GrpcException {
		return new GrpcException({
			code,
			message,
			status: GrpcStatus.NOT_FOUND,
		});
	}

	static invalidArgument(
		message: string,
		code = 'INVALID_ARGUMENT',
	): GrpcException {
		return new GrpcException({
			code,
			message,
			status: GrpcStatus.INVALID_ARGUMENT,
		});
	}

	static alreadyExists(
		message: string,
		code = 'ALREADY_EXISTS',
	): GrpcException {
		return new GrpcException({
			code,
			message,
			status: GrpcStatus.ALREADY_EXISTS,
		});
	}

	static permissionDenied(
		message: string,
		code = 'PERMISSION_DENIED',
	): GrpcException {
		return new GrpcException({
			code,
			message,
			status: GrpcStatus.PERMISSION_DENIED,
		});
	}

	static unauthenticated(
		message: string,
		code = 'UNAUTHENTICATED',
	): GrpcException {
		return new GrpcException({
			code,
			message,
			status: GrpcStatus.UNAUTHENTICATED,
		});
	}

	static internal(message: string, code = 'INTERNAL'): GrpcException {
		return new GrpcException({
			code,
			message,
			status: GrpcStatus.INTERNAL,
		});
	}

	static unavailable(message: string, code = 'UNAVAILABLE'): GrpcException {
		return new GrpcException({
			code,
			message,
			status: GrpcStatus.UNAVAILABLE,
		});
	}
}
