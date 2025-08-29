/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	Logger,
	UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type ValidationError } from 'class-validator';
import { type Response } from 'express';
import { isObject, isString } from 'lodash';

// import _ from 'lodash';

@Catch(UnprocessableEntityException)
export class HttpExceptionFilter
	implements ExceptionFilter<UnprocessableEntityException>
{
	private readonly logger = new Logger(HttpExceptionFilter.name);

	constructor(public reflector: Reflector) {}

	catch(exception: UnprocessableEntityException, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const statusCode = exception.getStatus();
		const responseData = exception.getResponse() as {
			message: ValidationError[] | string;
		};

		this.logger.error('Validation Errors', responseData);

		// Get the first validation error message if available
		const firstErrorMessage =
			isObject(responseData.message) ?
				(
					(responseData.message as unknown as ValidationError[])?.[0]
						?.constraints
				) ?
					Object.values(
						(responseData.message as unknown as ValidationError[])[0]
							.constraints!,
					)[0]
				:	'Unprocessable Entity'
			:	responseData.message;

		response.status(statusCode).json({
			...responseData,
			message: firstErrorMessage,
			validationErrors:
				isObject(responseData.message) ?
					(responseData.message as unknown as ValidationError[])?.map((e) => {
						return {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							value: e?.value,
							property: e?.property,
							constraints: e?.constraints,
						};
					})
				:	[],
		});
	}

	// private validationFilter(validationErrors: ValidationError[]): void {
	// 	for (const validationError of validationErrors) {
	// 		const children = validationError.children;

	// 		if (children && !_.isEmpty(children)) {
	// 			this.validationFilter(children);

	// 			return;
	// 		}

	// 		delete validationError.children;

	// 		const constraints = validationError.constraints;

	// 		if (!constraints) {
	// 			return;
	// 		}

	// 		for (const [constraintKey, constraint] of Object.entries(constraints)) {
	// 			// convert default messages
	// 			if (!constraint) {
	// 				// convert error message to error.fields.{key} syntax for i18n translation
	// 				constraints[constraintKey] = `error.fields.${_.snakeCase(constraintKey)}`;
	// 			}
	// 		}
	// 	}
	// }
}
