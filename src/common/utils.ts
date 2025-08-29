import { type Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import bcrypt from 'bcryptjs';
import { type ValidationError } from 'class-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { snakeCase } from 'lodash';
import crypto from 'node:crypto';
import fs from 'node:fs';

import { ECurrency } from '../core/entities/currency-conversion.entity';
import {
	GrpcStatus,
	PAGINATION_DEFAULT_PAGE,
	PAGINATION_DEFAULT_PAGE_SIZE,
} from './constants';
import {
	type CommonResponse,
	type Error as GrpcError,
	type PageResponse,
	type ResponseMetadata,
	type Status,
} from './types/proto/cwgame_api';
import { NullValue } from './types/proto/google/protobuf/struct';

/**
 * generate hash from password or string
 * @param {string} password
 * @returns {string}
 */
export function generateHash(password: string): string {
	return bcrypt.hashSync(password, 10);
}

/**
 * validate text with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function validateHash(
	password: string | undefined,
	hash: string | undefined | null,
): Promise<boolean> {
	if (!password || !hash) {
		return Promise.resolve(false);
	}

	return bcrypt.compare(password, hash);
}

export function getVariableName<TResult>(
	getVar: () => TResult,
): string | undefined {
	const m = /\(\)=>(.*)/.exec(
		getVar.toString().replaceAll(/(\r\n|\n|\r|\s)/gm, ''),
	);

	if (!m) {
		throw new Error(
			"The function does not contain a statement matching 'return variableName;'",
		);
	}

	const fullMemberName = m[1];

	const memberParts = fullMemberName.split('.');

	// eslint-disable-next-line n/no-unsupported-features/es-syntax
	return memberParts.at(-1);
}

export function formatError(errors: ValidationError[]): string[] {
	return errors.map(
		(e) =>
			`${e.property} has to be ${Object.keys(e.constraints || {}).join(', ')}`,
	);
}

/**
 * Filters the fields of an object based on the allowed fields.
 *
 * @param item - The input object to be filtered.
 * @param allowedFields - An array of allowed field names.
 * @returns A new object containing only the allowed fields.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterFields<T extends Record<string, any>>(
	item: T,
	allowedFields: Array<keyof T | string>,
): Partial<T> | T {
	const filtered: Partial<T> | T = {};

	for (const key of allowedFields) {
		if (key in item) {
			filtered[key] = item[key];
		}
	}

	return filtered;
}

export function generateRandomCode(
	prefix: string,
	length = 5,
	isDigit = false,
): string {
	const characters =
		isDigit ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	const prefixCode = prefix.split(' ')[0].toUpperCase();

	const code = Array.from({ length }, () =>
		characters.charAt(Math.floor(Math.random() * characters.length)),
	)
		.join('')
		.toUpperCase();

	return `${prefixCode}-${code}`;
}

export function generateCode(length = 6): string {
	return crypto
		.randomBytes(Math.trunc(length / 2))
		.toString('hex')
		.slice(0, length)
		.toUpperCase();
}

export function formatDateYYMMDD(date: Date): string {
	return `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1)
		.toString()
		.padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
}

export function mapHourMinuteToAlpha(hour: number, minute: number): string {
	// Hour 1 -> 'A'; 24 -> 'Z'
	// Minute 0 -> 'AA'; 1: 'AB', 2: 'AC',..., 26: 'AZ', 27: 'BA',..., 52: 'BZ', 53: 'CA',...

	const hourAlpha = String.fromCodePoint(65 + hour);
	const minuteAlpha = String.fromCodePoint(65 + Math.ceil(minute / 26));
	const minuteRemainder = minute % 26;
	const minuteAlphaRemainder = String.fromCodePoint(65 + minuteRemainder);

	return hourAlpha + minuteAlpha + minuteAlphaRemainder;
}

export function mapMMDDToAlpha(date: Date): string {
	const monthAlpha = String.fromCodePoint(64 + date.getMonth() + 1);
	const dayAlpha = String.fromCodePoint(64 + (date.getDate() % 26) + 1);

	return `${monthAlpha}${dayAlpha}`;
}

export function isEmptyObject(obj: Record<string, unknown>): boolean {
	return Object.keys(obj).length === 0;
}

// filter undefined fields in object
export function filterUndefinedFields<T extends Record<string, unknown>>(
	obj: T,
): Partial<T> {
	return Object.fromEntries(
		Object.entries(obj).filter(([_, value]) => value !== undefined),
	) as Partial<T>;
}

export function hasDuplicates(datas: string[]): boolean {
	const uniqueIds = new Set(datas);

	return uniqueIds.size !== datas.length;
}

export function getPagination({
	page,
	pageSize,
}: {
	page: number | undefined;
	pageSize: number | undefined;
}): { offset: number; limit: number } {
	page = page || PAGINATION_DEFAULT_PAGE;
	pageSize = pageSize || PAGINATION_DEFAULT_PAGE_SIZE;

	return { offset: (page - 1) * pageSize, limit: pageSize };
}

export function createCacheKey(prefix: string, params: unknown): string {
	const hash = crypto
		.createHash('sha256')
		.update(JSON.stringify(params))
		.digest('hex');

	return `${prefix}-${hash}`;
}

export function createItemCodeCacheKey(itemCode: string): string {
	return `item-${itemCode}`;
}

export function standardizePrice(price: number, currency: ECurrency): number {
	switch (currency) {
		case ECurrency.VND: {
			return Math.round(price);
		}

		case ECurrency.PHP: {
			return Number(price.toFixed(2));
		}

		default: {
			throw new Error('Unsupported currency');
		}
	}
}

export function isSearchableFieldDB(
	field: string,
	fields: Record<string, string>,
): boolean {
	return Object.values(fields).includes(field);
}

export function isOrderableFieldDB(
	field: string,
	fields: Record<string, string>,
): boolean {
	return Object.values(fields).includes(field);
}

export function getEnvFilePath(): string {
	let envFilePath = '.env';

	switch (process.env.NODE_ENV) {
		case 'production': {
			envFilePath = '.env.production';

			break;
		}

		case 'staging': {
			envFilePath = '.env.staging';

			break;
		}

		case 'test': {
			envFilePath = '.env.test';

			break;
		}

		default: {
			envFilePath = '.env';

			break;
		}
	}

	// check if the file is exists
	if (!fs.existsSync(envFilePath)) {
		throw new Error(`File ${envFilePath} not found`);
	}

	// TODO: Remove this after testing
	// if (process.env.NODE_ENV === 'production' && !fs.existsSync(envFilePath)) {
	// 	throw new Error(`File ${envFilePath} not found`);
	// }

	console.info(
		`********* ENV=[${process.env.NODE_ENV}] envFilePath=[${envFilePath}]`,
	);

	return envFilePath;
}

/*
jsonb_set(
   target jsonb,
   path text[],
   new_value jsonb
   [, create_missing boolean]
)

example:   jsonb_set('{"name": "Jane Doe"}', '{name}', '"Jane Smith"');

UPDATE app.land_crops l
SET metadata = metadata || '{
    "phone": "555-1234",
    "email": "ss.doe@example.com", "asf": 123
}'
WHERE l.id = '019818e0-c652-70ab-ab5b-626d87c582dc';
*/
export function setJsonbField(
	fieldName: string,
	fieldValue: Record<string, unknown>,
): string {
	return `jsonb_set(${fieldName},'{${Object.keys(fieldValue)
		.map((k) => snakeCase(k))
		.join(',')}}',${Object.values(fieldValue)
		.map((value) => `'${JSON.stringify(value)}'`)
		.join(',')})`;
}

export function generateBookingDisplayId(
	serviceType: string,
	number: number,
): string {
	const letters = serviceType.split('_').map((l) => l[0]);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return `${letters?.[0]?.toUpperCase() || 'B'}${letters?.[1]?.toUpperCase() || ''}-${number}`;
}

export function isPhoneNumberValid(phone: string): boolean {
	const phoneNumber = parsePhoneNumberFromString(phone);

	return phoneNumber?.isValid() ?? false;
}

export function isEmailValid(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	return emailRegex.test(email);
}

export function resp(translateKey: string, args?: Record<string, unknown>) {
	return {
		translateKey,
		args,
	};
}

// Utility to get all instance fields of a class (excluding methods)
export function getInstanceFields<T>(instance: T): string[] {
	return Object.getOwnPropertyNames(instance).filter(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
		(key) => typeof (instance as any)[key] !== 'function',
	);
}

// Function to filter updated object to valid class fields
export function filterValidFields<T extends Record<string, unknown>>(
	updatedObject: Partial<T>,
	validFields: string[] = getInstanceFields(updatedObject as T),
): Partial<T> | T {
	const filtered: Partial<T> = {};

	for (const key of Object.keys(updatedObject)) {
		if (validFields.includes(key)) {
			filtered[key as keyof T] = updatedObject[key as keyof T];
		}
	}

	return filtered;
}

export function grpcResponse(
	{
		status,
		data,
		error,
		metadata,
	}: {
		status?: Status;
		// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style, @typescript-eslint/no-explicit-any
		data?: { [key: string]: any } | undefined;
		error?: GrpcError;
		metadata?: ResponseMetadata;
		// eslint-disable-next-line unicorn/no-object-as-default-parameter
	} = {
		status: { code: GrpcStatus.OK, message: 'Success', isSuccess: true },
		data: undefined,
		error: undefined,
		metadata: undefined,
	},
): CommonResponse {
	if (!status) {
		status = { code: GrpcStatus.OK, message: 'Success', isSuccess: true };
	}

	return {
		status,
		data,
		error,
		metadata,
	};
}

export function convertToPrimitive(data: unknown): {
	value: unknown;
	isPrimitive: boolean;
} {
	if (data === null || data === undefined) {
		return {
			value: { nullValue: NullValue.NULL_VALUE },
			isPrimitive: true,
		};
	}

	if (typeof data === 'string') {
		return {
			value: { stringValue: data },
			isPrimitive: true,
		};
	}

	if (typeof data === 'number') {
		return {
			value: { numberValue: data },
			isPrimitive: true,
		};
	}

	if (typeof data === 'boolean') {
		return {
			value: { boolValue: data },
			isPrimitive: true,
		};
	}

	return { value: data, isPrimitive: false };
}

export function convertToStruct(
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	data: Record<string, unknown> | undefined | string,
): Record<string, unknown> {
	/*
     Represents a null value.
    NullValue null_value = 1;
    Represents a double value.
    double number_value = 2;
    Represents a string value.
    string string_value = 3;
    Represents a boolean value.
    bool bool_value = 4;
    Represents a structured value.
    Struct struct_value = 5;
    Represents a repeated `Value`.
    ListValue list_value = 6;
    */
	// if the data is a string, parse it to an object
	if (typeof data === 'string') {
		try {
			data = JSON.parse(data) as Record<string, unknown>;
		} catch {
			throw new Error('Invalid JSON string');
		}
	}

	if (data === undefined || Object.keys(data).length === 0) {
		return { fields: {} };
	}

	const fields = Object.entries(data).map(([key, value]) => {
		if (value === null || value === undefined) {
			return { [key]: { nullValue: NullValue.NULL_VALUE } };
		}

		if (typeof value === 'string') {
			return { [key]: { stringValue: value } };
		}

		if (typeof value === 'number') {
			return { [key]: { numberValue: value } };
		}

		if (typeof value === 'boolean') {
			return { [key]: { boolValue: value } };
		}

		// array
		if (Array.isArray(value)) {
			return {
				[key]: {
					listValue: {
						values: value.map((v) => {
							const { value: primitiveValue, isPrimitive } =
								convertToPrimitive(v);

							if (isPrimitive) {
								return primitiveValue;
							}

							return convertToStruct(v as Record<string, unknown>);
						}),
					},
				},
			};
		}

		if (typeof value === 'object') {
			return {
				[key]: {
					structValue: convertToStruct(value as Record<string, unknown>),
				},
			};
		}

		return { [key]: { stringValue: NullValue.UNRECOGNIZED } };
	});

	return { fields: Object.assign({}, ...fields) };
}

export function convertToGrpcPagination({
	page,
	pageSize,
	total,
	pageToken,
}: {
	page?: number;
	pageSize?: number;
	total: number;
	pageToken?: string;
}): PageResponse {
	page = page || PAGINATION_DEFAULT_PAGE;
	pageSize = pageSize || PAGINATION_DEFAULT_PAGE_SIZE;

	const totalPages = Math.ceil(total / pageSize);
	const pagination: PageResponse = {
		pageToken: pageToken || '',
		nextPageToken: page < totalPages ? `page_${page + 1}` : '',
		prevPageToken: page > 1 ? `page_${page - 1}` : '',
		totalCount: total,
		totalPages,
		currentPage: page,
		pageSize,
	};

	return pagination;
}

/**
 * Throw a grpc error as format: DisplayMessage || RealMessage from server
 */
export function throwGrpcError(
	logger: Logger,
	error: Error | RpcException,
	message: string,
	params?: Record<string, unknown>,
): RpcException {
	logger.error({
		displayMessage: message,
		message: error.message || message,
		...(error instanceof RpcException && {
			error: { code: (error.getError() as { code: number }).code },
		}),
		stack: error.stack,
		...(params && { params }),
	});

	if (error instanceof RpcException) {
		throw error;
	}

	const displayMessage =
		error.message && error.message !== message ? error.message : message;

	return new RpcException({
		code: GrpcStatus.INTERNAL,
		message: displayMessage,
	});
}
