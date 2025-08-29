/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform, TransformationType } from 'class-transformer';
import { parsePhoneNumber } from 'libphonenumber-js';
import { castArray, isArray, isNil, map, trim } from 'lodash';

import { GeneratorProvider } from '../common/providers/generator.provider';

/**
 * @description trim spaces from start and end, replace multiple spaces with one.
 * @example
 * @ApiProperty()
 * @IsString()
 * @Trim()
 * name: string;
 * @returns PropertyDecorator
 * @constructor
 */
export function Trim(): PropertyDecorator {
	return Transform((params) => {
		const value = params.value as string[] | string;

		if (isArray(value)) {
			return map(value, (v) => trim(v).replaceAll(/\s\s+/g, ' '));
		}

		return trim(value).replaceAll(/\s\s+/g, ' ');
	});
}

export function ToBoolean(): PropertyDecorator {
	return Transform(
		(params) => {
			switch (params.value) {
				case 'true': {
					return true;
				}

				case 'false': {
					return false;
				}

				default: {
					return params.value;
				}
			}
		},
		{ toClassOnly: true },
	);
}

/**
 * @description convert string or number to integer
 * @example
 * @IsNumber()
 * @ToInt()
 * name: number;
 * @returns PropertyDecorator
 * @constructor
 */
export function ToInt(): PropertyDecorator {
	return Transform(
		(params) => {
			const value = params.value as string;

			return Number.parseInt(value, 10);
		},
		{ toClassOnly: true },
	);
}

/**
 * @description transforms to array, specially for query params
 * @example
 * @IsNumber()
 * @ToArray()
 * name: number;
 * @constructor
 */
export function ToArray(): PropertyDecorator {
	return Transform(
		(params) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const value = params.value;

			if (isNil(value)) {
				return [];
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return castArray(value);
		},
		{ toClassOnly: true },
	);
}

export function ToLowerCase(): PropertyDecorator {
	return Transform(
		(params) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const value = params.value;

			if (!value) {
				return;
			}

			if (!Array.isArray(value)) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return value.toLowerCase();
			}

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return value.map((v) => v.toLowerCase());
		},
		{
			toClassOnly: true,
		},
	);
}

export function ToUpperCase(): PropertyDecorator {
	return Transform(
		(params) => {
			const value = params.value;

			if (!value) {
				return;
			}

			if (!Array.isArray(value)) {
				return value.toUpperCase();
			}

			return value.map((v) => v.toUpperCase());
		},
		{
			toClassOnly: true,
		},
	);
}

export function S3UrlParser(): PropertyDecorator {
	return Transform((params) => {
		const key = params.value as string;

		switch (params.type) {
			case TransformationType.CLASS_TO_PLAIN: {
				return GeneratorProvider.getS3PublicUrl(key);
			}

			case TransformationType.PLAIN_TO_CLASS: {
				return GeneratorProvider.getS3Key(key);
			}

			default: {
				return key;
			}
		}
	});
}

export function PhoneNumberSerializer(): PropertyDecorator {
	return Transform((params) => parsePhoneNumber(params.value as string).number);
}

export const handlePhoneNumber = (
	phone: string,
	phoneCountryCode?: string,
): string | undefined => {
	// only allow number and +
	if (!/^\d+$/.test(phone) && !/^\+\d+$/.test(phone)) {
		throw new Error('Phone number is invalid format.');
	}

	// Step 1: Normalize phone number input
	let normalizedPhone = phone.replaceAll(/\D/g, '');

	// Step 2: Handle numbers with a leading '0' (local format)
	if (normalizedPhone.startsWith('0')) {
		normalizedPhone = normalizedPhone.slice(1); // Remove the leading '0'
	}

	// console.info('xxx 172 normalizedPhone', normalizedPhone);

	// Step 3: Check if the number includes country code (e.g., +84 or 84)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
	if (
		phoneCountryCode &&
		normalizedPhone.startsWith(phoneCountryCode.replace('+', ''))
	) {
		const sliceLength = Math.max(
			0,
			phoneCountryCode.startsWith('+') ?
				phoneCountryCode.length - 1
			:	phoneCountryCode.length,
		);
		// Math.max(0, '+84'.length - 1) = 3
		normalizedPhone = normalizedPhone.slice(sliceLength); // Remove the country code part if included

		if (normalizedPhone.startsWith('0')) {
			normalizedPhone = normalizedPhone.slice(1); // Remove the leading '0'
		}
	}

	// console.info('xxx 173 normalizedPhone', normalizedPhone);

	// Step 4: Combine phoneCountryCode and normalizedPhone
	const fullPhoneNumber = `${phoneCountryCode?.startsWith('+') ? '' : '+'}${phoneCountryCode ?? ''}${normalizedPhone}`;

	// console.info('xxx 174 fullPhoneNumber', fullPhoneNumber);

	try {
		return fullPhoneNumber;
		// Step 5: Validate and format the combined number using libphonenumber-js
		// const phoneNumber = parsePhoneNumberWithError(fullPhoneNumber);

		// console.info('xxx 175 phoneNumber', phoneNumber);

		// Step 6: If valid, return in E.164 format; else, throw an error
		// if (phoneNumber.isValid()) {
		// 	return phoneNumber.format('E.164'); // Return in E.164 format
		// }
	} catch {
		throw new Error(
			`Invalid phone format: phoneCountryCode ${phoneCountryCode} with phone ${phone}`,
		);
	}
};

export function TransformPhoneNumber(phoneCountryCode: string) {
	return Transform((params) => {
		return handlePhoneNumber(params.value as string, phoneCountryCode);
	});
}
