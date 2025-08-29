import { type PostgresErrorCode } from '../constants/enums';

export interface IDatabaseError {
	code: PostgresErrorCode;
	detail?: string;
	table?: string;
	column?: string;
	routine?: string;
	where?: string;
	message?: string;
}

// The isRecord is a function that we wrote earlier. It checks if a particular value is of the Record<string, unknown> type.
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export function isDatabaseError(value: unknown): value is IDatabaseError {
	if (!isRecord(value)) {
		return false;
	}

	const { code, name, routine, message } = value;

	return Boolean(code && name && routine && message);
}
