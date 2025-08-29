import { UnprocessableEntityException } from '@nestjs/common';
import {
	ValidateIf,
	type ValidationOptions,
	IsPhoneNumber as isPhoneNumber,
	registerDecorator,
} from 'class-validator';
import { isString } from 'lodash';

import { resp } from '../common/utils';
import { i18nKeys } from '../core/interfaces';

export function IsPassword(
	validationOptions?: ValidationOptions,
): PropertyDecorator {
	return (object, propertyName) => {
		registerDecorator({
			propertyName: propertyName as string,
			name: 'isPassword',
			target: object.constructor,
			constraints: [],
			options: validationOptions,
			validator: {
				validate(value: string) {
					// const regex = /^[\d!#$%&()*@A-Z^a-z]*$/;
					// allow all characters except space
					const regex = /^\S*$/;

					// check if the password contains invalid characters
					const invalidCharacters = [...value].filter(
						(char) => !regex.test(char),
					);

					if (invalidCharacters.length > 0) {
						throw new UnprocessableEntityException({
							...validationOptions,
							errorType: 'UnprocessableEntity',
							message: resp(i18nKeys.errors.passwordInvalidCharacters, {
								characters: invalidCharacters[0],
							}),
						});
					}

					return true;
				},
			},
		});
	};
}

export function IsPhoneNumber(
	validationOptions?: ValidationOptions & {
		region?: Parameters<typeof isPhoneNumber>[0];
	},
): PropertyDecorator {
	return isPhoneNumber(validationOptions?.region, {
		message: 'Phone number is invalid',
		...validationOptions,
	});
}

export function IsPhoneCountryCode(
	validationOptions?: ValidationOptions,
	isOptional?: boolean,
): PropertyDecorator {
	// check '+' prefix and is 2-3 characters of digits
	return (object, propertyName) => {
		registerDecorator({
			propertyName: propertyName as string,
			name: 'phoneCountryCode',
			target: object.constructor,
			options: validationOptions,
			validator: {
				validate(value: string): boolean {
					if (isOptional && !value) {
						return true;
					}

					// + is optional
					const isValid = /^\+\d{2,3}$|^\d{2,3}$/.test(value);

					if (!isValid) {
						throw new Error('Phone country code is invalid format.');
					}

					return isValid;
				},
				defaultMessage(): string {
					return 'error.invalidPhoneCountryCode';
				},
			},
		});
	};
}

export function IsTmpKey(
	validationOptions?: ValidationOptions,
): PropertyDecorator {
	return (object, propertyName) => {
		registerDecorator({
			propertyName: propertyName as string,
			name: 'tmpKey',
			target: object.constructor,
			options: validationOptions,
			validator: {
				validate(value: string): boolean {
					return isString(value) && /^tmp\//.test(value);
				},
				defaultMessage(): string {
					return 'error.invalidTmpKey';
				},
			},
		});
	};
}

export function IsUndefinable(options?: ValidationOptions): PropertyDecorator {
	return ValidateIf((_obj, value) => value !== undefined, options);
}

export function IsNullable(options?: ValidationOptions): PropertyDecorator {
	return ValidateIf((_obj, value) => value !== null, options);
}
