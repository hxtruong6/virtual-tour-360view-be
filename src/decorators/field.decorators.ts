/* eslint-disable unicorn/no-null */
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsDate,
	IsDefined,
	IsEmail,
	IsEmpty,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsPositive,
	IsString,
	IsUUID,
	IsUrl,
	Max,
	MaxLength,
	Min,
	MinLength,
	NotEquals,
	ValidateNested,
} from 'class-validator';

import { supportedLanguageCount } from '../common/constants';
import { type Constructor } from '../types';
import { ApiEnumProperty, ApiUUIDProperty } from './property.decorators';
import {
	PhoneNumberSerializer,
	ToArray,
	ToBoolean,
	ToLowerCase,
	ToUpperCase,
	Trim,
} from './transform.decorators';
import {
	IsNullable,
	IsPassword,
	IsPhoneCountryCode,
	IsPhoneNumber,
	IsTmpKey as IsTemporaryKey,
	IsUndefinable,
} from './validator.decorators';

type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;

interface IFieldOptions {
	each?: boolean;
	swagger?: boolean;
	nullable?: boolean;
	groups?: string[];
	strictlyCheck?: boolean;
}

interface INumberFieldOptions extends IFieldOptions {
	min?: number;
	max?: number;
	int?: boolean;
	isPositive?: boolean;
}

interface IStringFieldOptions extends IFieldOptions {
	minLength?: number;
	maxLength?: number;
	toLowerCase?: boolean;
	toUpperCase?: boolean;
}

type IClassFieldOptions = IFieldOptions;
type IBooleanFieldOptions = IFieldOptions;
type IEnumFieldOptions = IFieldOptions;

export function NumberField(
	options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
	const decorators = [Expose(), Type(() => Number)];

	if (options.nullable) {
		decorators.push(IsNullable({ each: options.each }));
	} else {
		decorators.push(NotEquals(null, { each: options.each }));
	}

	if (options.swagger !== false) {
		decorators.push(ApiProperty({ type: Number, ...options }));
	}

	if (options.each) {
		decorators.push(ToArray());
	}

	if (options.int) {
		decorators.push(IsInt({ each: options.each }));
	} else {
		decorators.push(IsNumber({}, { each: options.each }));
	}

	if (typeof options.min === 'number') {
		decorators.push(Min(options.min, { each: options.each }));
	}

	if (typeof options.max === 'number') {
		decorators.push(Max(options.max, { each: options.each }));
	}

	if (options.default) {
		decorators.push(
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			Transform(({ value }) => value ?? options.default, {
				toClassOnly: true,
			}),
		);
	}

	if (options.isPositive) {
		decorators.push(IsPositive({ each: options.each }));
	}

	return applyDecorators(...decorators);
}

export function NumberFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required'> &
		INumberFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		NumberField({ required: false, ...options }),
	);
}

export function StringField(
	options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
	const decorators = [
		Expose(),
		Type(() => String),
		IsString({ each: options.each }),
	];

	if (options.nullable) {
		decorators.push(IsNullable({ each: options.each }));
	} else {
		decorators.push(NotEquals(null, { each: options.each }));
	}

	if (options.swagger !== false) {
		decorators.push(
			ApiProperty({ type: String, ...options, isArray: options.each }),
		);
	}

	const minLength = options.minLength || 0;

	decorators.push(MinLength(minLength, { each: options.each }));

	if (options.maxLength) {
		decorators.push(MaxLength(options.maxLength, { each: options.each }));
	}

	if (options.toLowerCase) {
		decorators.push(ToLowerCase());
	}

	if (options.toUpperCase) {
		decorators.push(ToUpperCase());
	}

	if (options.default) {
		decorators.push(
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			Transform(({ value }) => value ?? (options.default as string), {
				toClassOnly: true,
			}),
		);
	}

	return applyDecorators(...decorators);
}

export function StringFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required'> &
		IStringFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		StringField({ required: false, ...options }),
	);
}

export function PasswordField(
	options: Omit<ApiPropertyOptions, 'type' | 'minLength'> &
		IStringFieldOptions = {},
): PropertyDecorator {
	const decorators = [StringField({ ...options, minLength: 4 }), IsPassword()];

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	return applyDecorators(...decorators);
}

export function PasswordFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required' | 'minLength'> &
		IStringFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		PasswordField({ required: false, ...options }),
	);
}

export function BooleanField(
	options: Omit<ApiPropertyOptions, 'type'> & IBooleanFieldOptions = {},
): PropertyDecorator {
	const decorators = [Expose(), ToBoolean(), IsBoolean()];

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	if (options.swagger !== false) {
		decorators.push(ApiProperty({ type: Boolean, ...options }));
	}

	return applyDecorators(...decorators);
}

export function BooleanFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required'> &
		IBooleanFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		BooleanField({ required: false, ...options }),
	);
}

export function TranslationsField(
	options: RequireField<Omit<ApiPropertyOptions, 'isArray'>, 'type'> &
		IFieldOptions,
): PropertyDecorator {
	const decorators = [
		Expose(),
		ArrayMinSize(supportedLanguageCount),
		ArrayMaxSize(supportedLanguageCount),
		ValidateNested({
			each: true,
		}),
		Type(() => options.type as FunctionConstructor),
	];

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	if (options.swagger !== false) {
		decorators.push(ApiProperty({ isArray: true, ...options }));
	}

	return applyDecorators(...decorators);
}

export function TranslationsFieldOptional(
	options: RequireField<Omit<ApiPropertyOptions, 'isArray'>, 'type'> &
		IFieldOptions,
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		TranslationsField({ required: false, ...options }),
	);
}

export function TmpKeyField(
	options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
	const decorators = [
		StringField(options),
		IsTemporaryKey({ each: options.each }),
	];

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	if (options.swagger !== false) {
		decorators.push(
			ApiProperty({ type: String, ...options, isArray: options.each }),
		);
	}

	return applyDecorators(...decorators);
}

export function TmpKeyFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required'> &
		IStringFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		TmpKeyField({ required: false, ...options }),
	);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function EnumField<TEnum extends object>(
	getEnum: () => TEnum,
	options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'enumName' | 'isArray'> &
		IEnumFieldOptions = {},
): PropertyDecorator {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types
	const enumValue = getEnum();
	const decorators = [Expose(), IsEnum(enumValue, { each: options.each })];

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	if (options.each) {
		decorators.push(ToArray());
	}

	if (options.swagger !== false) {
		decorators.push(
			ApiEnumProperty(getEnum, { ...options, isArray: options.each }),
		);
	}

	if (options.default) {
		decorators.push(
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			Transform(({ value }) => value ?? options.default, {
				toClassOnly: true,
			}),
		);
	}

	return applyDecorators(...decorators);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function ClassField<TClass extends Constructor>(
	getClass: () => TClass,
	options: Omit<ApiPropertyOptions, 'type'> & IClassFieldOptions = {},
): PropertyDecorator {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const classValue = getClass();

	const decorators = [
		Expose(),
		Type(() => classValue),
		ValidateNested({ each: options.each }),
	];

	if (options.required !== false) {
		decorators.push(IsDefined());
	}

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	if (options.default) {
		decorators.push(
			Transform(({ value }) => value ?? options.default, {
				toClassOnly: true,
			}),
		);
	}

	if (options.swagger !== false) {
		decorators.push(
			ApiProperty({
				type: () => classValue,
				...options,
			}),
		);
	}

	// if (options.each) {
	//   decorators.push(ToArray());
	// }

	return applyDecorators(...decorators);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function EnumFieldOptional<TEnum extends object>(
	getEnum: () => TEnum,
	options: Omit<ApiPropertyOptions, 'type' | 'required' | 'enum' | 'enumName'> &
		IEnumFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		EnumField(getEnum, { required: false, ...options }),
	);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function ClassFieldOptional<TClass extends Constructor>(
	getClass: () => TClass,
	options: Omit<ApiPropertyOptions, 'type' | 'required'> &
		IClassFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		ClassField(getClass, { required: false, ...options }),
	);
}

export function EmailField(
	options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
	const decorators = [
		Expose(),
		...(options.required === false ? [IsUndefinable()] : []),
		IsEmail(),
		StringField({ toLowerCase: true, ...options }),
	];

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	if (options.swagger !== false) {
		decorators.push(ApiProperty({ type: String, ...options }));
	}

	return applyDecorators(...decorators);
}

export function EmailFieldOptional(
	options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		EmailField({ required: false, ...options }),
	);
}

export function PhoneField(
	options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
	const decorators = [
		Expose(),
		Trim(),
		// Disable this due to lack of country code to validate
		...(options.strictlyCheck ?
			[IsPhoneNumber(), PhoneNumberSerializer(), IsNotEmpty()]
		:	[]),
		...(options.required === false ? [IsOptional()] : [IsNotEmpty()]),
		IsString({ minLength: 7, maxLength: 15, ...options }),
	];

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	if (options.swagger !== false) {
		decorators.push(ApiProperty({ type: String, ...options }));
	}

	return applyDecorators(...decorators);
}

export function PhoneFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsOptional(),
		IsUndefinable(),
		IsEmpty(),
		PhoneField({ ...options, required: false }),
	);
}

export function PhoneCountryCodeField(
	options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
	const decorators = [
		Expose(),
		Trim(),
		...(options.required === false ? [IsOptional()] : [IsNotEmpty()]),
		IsString({ minLength: 2, maxLength: 4, ...options }),
		IsPhoneCountryCode(undefined, options.required === false),
	];

	if (options.swagger !== false) {
		decorators.push(ApiProperty({ type: String, ...options }));
	}

	return applyDecorators(...decorators);
}

export function PhoneCountryCodeFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required'> &
		IStringFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		IsOptional(),
		PhoneCountryCodeField({ ...options, required: false, nullable: true }),
	);
}

export function UUIDField(
	options: Omit<ApiPropertyOptions, 'type' | 'format' | 'isArray'> &
		IFieldOptions = {},
): PropertyDecorator {
	const decorators = [
		Expose(),
		Type(() => String),
		IsUUID('all', { each: options.each }),
	];

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	if (options.swagger !== false) {
		decorators.push(ApiUUIDProperty(options));
	}

	if (options.each) {
		decorators.push(ToArray());
	}

	return applyDecorators(...decorators);
}

export function UUIDFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required' | 'isArray'> &
		IFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		UUIDField({ required: false, ...options }),
	);
}

export function URLField(
	options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
	const decorators = [
		Expose(),
		StringField(options),
		IsUrl({}, { each: true }),
	];

	if (options.nullable) {
		decorators.push(IsNullable({ each: options.each }));
	} else {
		decorators.push(NotEquals(null, { each: options.each }));
	}

	return applyDecorators(...decorators);
}

export function URLFieldOptional(
	options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		URLField({ required: false, ...options }),
	);
}

export function DateField(
	options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
	const decorators = [Expose(), Type(() => Date), IsDate()];

	if (options.nullable) {
		decorators.push(IsNullable());
	} else {
		decorators.push(NotEquals(null));
	}

	if (options.swagger !== false) {
		decorators.push(ApiProperty({ type: Date, ...options }));
	}

	return applyDecorators(...decorators);
}

export function DateFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		DateField({ ...options, required: false }),
	);
}

export function JsonField(
	options: Omit<ApiPropertyOptions, 'type'> & IFieldOptions = {},
): PropertyDecorator {
	const decorators = [Expose(), Type(() => Object)];

	decorators.push(IsObject({ ...options }));

	return applyDecorators(...decorators);
}

export function JsonFieldOptional(
	options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {},
): PropertyDecorator {
	return applyDecorators(
		IsUndefinable(),
		JsonField({ ...options, required: false }),
	);
}
