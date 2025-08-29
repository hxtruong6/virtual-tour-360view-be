/**
 * gRPC Status Codes
 * Reference: https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 */
export enum GrpcStatus {
	OK = 0, // The operation completed successfully.
	CANCELLED = 1, // The operation was cancelled, typically by the caller.
	UNKNOWN = 2, // The operation was cancelled, typically by the caller.
	INVALID_ARGUMENT = 3, // The client specified an invalid argument. Note that this differs from FAILED_PRECONDITION.
	DEADLINE_EXCEEDED = 4, // The deadline expired before the operation could complete.
	NOT_FOUND = 5, // The requested resource was not found.
	ALREADY_EXISTS = 6, // The entity that a client attempted to create already exists.
	PERMISSION_DENIED = 7, // The caller does not have permission to execute the specified operation.
	RESOURCE_EXHAUSTED = 8, // Resource exhausted (e.g. memory, file descriptor, socket, etc).
	FAILED_PRECONDITION = 9, // The operation was rejected because the system is not in a state required for the operation's execution.
	ABORTED = 10, // The operation was aborted, typically due to a concurrent operation.
	OUT_OF_RANGE = 11, // The operation was attempted past the valid range.
	UNIMPLEMENTED = 12, // The operation is not implemented or is not supported/enabled in this service.
	INTERNAL = 13, // Internal errors. This means that this is likely a bug in the service and should be reported to developer.
	// eslint-disable-next-line max-len
	UNAVAILABLE = 14, // The service is currently unavailable. This is a most likely a transient condition and may be corrected by retrying with a backoff.
	DATA_LOSS = 15, // Unrecoverable data loss or corruption.
	UNAUTHENTICATED = 16, // Invalid or missing authentication.
}

/**
 * Mapping from HTTP status codes to gRPC status codes
 */
export const HTTP_TO_GRPC_STATUS_MAP = new Map<number, GrpcStatus>([
	[200, GrpcStatus.OK],
	[201, GrpcStatus.OK],
	[204, GrpcStatus.OK],
	[400, GrpcStatus.INVALID_ARGUMENT],
	[401, GrpcStatus.UNAUTHENTICATED],
	[403, GrpcStatus.PERMISSION_DENIED],
	[404, GrpcStatus.NOT_FOUND],
	[409, GrpcStatus.ALREADY_EXISTS],
	[422, GrpcStatus.INVALID_ARGUMENT],
	[429, GrpcStatus.RESOURCE_EXHAUSTED],
	[500, GrpcStatus.INTERNAL],
	[502, GrpcStatus.UNAVAILABLE],
	[503, GrpcStatus.UNAVAILABLE],
	[504, GrpcStatus.DEADLINE_EXCEEDED],
]);

/**
 * Mapping from gRPC status codes to HTTP status codes
 */
export const GRPC_TO_HTTP_STATUS: Record<GrpcStatus, number> = {
	[GrpcStatus.OK]: 200,
	[GrpcStatus.CANCELLED]: 499,
	[GrpcStatus.UNKNOWN]: 500,
	[GrpcStatus.INVALID_ARGUMENT]: 400,
	[GrpcStatus.DEADLINE_EXCEEDED]: 504,
	[GrpcStatus.NOT_FOUND]: 404,
	[GrpcStatus.ALREADY_EXISTS]: 409,
	[GrpcStatus.PERMISSION_DENIED]: 403,
	[GrpcStatus.RESOURCE_EXHAUSTED]: 429,
	[GrpcStatus.FAILED_PRECONDITION]: 400,
	[GrpcStatus.ABORTED]: 409,
	[GrpcStatus.OUT_OF_RANGE]: 400,
	[GrpcStatus.UNIMPLEMENTED]: 501,
	[GrpcStatus.INTERNAL]: 500,
	[GrpcStatus.UNAVAILABLE]: 503,
	[GrpcStatus.DATA_LOSS]: 500,
	[GrpcStatus.UNAUTHENTICATED]: 401,
};

export const GRPC_ERROR_CODES = {
	INSUFFICIENT_QUANTITY: 'INSUFFICIENT_QUANTITY',
	NOT_ENOUGH_CURRENCY: 'NOT_ENOUGH_CURRENCY',
	NOT_ENOUGH_ITEM: 'NOT_ENOUGH_ITEM',
};
