/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
	LoggerProvider,
	SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import chalk from 'chalk';
import { config } from 'dotenv';
import crypto from 'node:crypto';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { type RequestContextService } from './request-context.service';

config();

const chalkObject = (value: any, depth = 0, maxDepth = 4): string => {
	if (value === null) {
		return chalk.bgGray('null');
	}

	if (value === undefined) {
		return chalk.gray('undefined');
	}

	if (typeof value === 'object' && depth < maxDepth) {
		// Handle arrays
		if (Array.isArray(value)) {
			const arrayItems = value
				.map((item) => chalkObject(item, depth + 1, maxDepth))
				.join(', ');

			return chalk.yellow(`[${arrayItems}]`);
		}

		// Handle objects
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const entries = Object.entries(value)
			.map(([key, val]) => {
				const coloredKey =
					key === 'context' || key === 'message' ?
						chalk.bold.green(key)
					:	chalk.yellow(key);

				return `${coloredKey}: ${chalkObject(val, depth + 1, maxDepth)}`;
			})
			.join(',\n' + '  '.repeat(depth + 1));

		return `{\n${'  '.repeat(depth + 1)}${entries}\n${'  '.repeat(depth)}}`;
	}

	// Handle strings
	if (typeof value === 'string') {
		// return chalk.white(`"${value}"`);
		return `"${value}"`;
	}

	// Handle numbers
	if (typeof value === 'number') {
		return chalk.cyan(value.toString());
	}

	// Handle booleans
	if (typeof value === 'boolean') {
		return chalk.magenta(value.toString());
	}

	// Handle symbols
	if (typeof value === 'symbol') {
		return chalk.red(value.toString());
	}

	// Fallback for other types
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	return chalk.whiteBright(value.toString());
};

// Generate a consistent color for each requestId
const generateRequestColor = (requestId: string) => {
	// Hash the requestId to ensure consistency
	const hash = crypto.createHash('sha256').update(requestId).digest('hex');

	// Take the first 6 characters of the hash to form a valid hex color
	// Ensure the color is valid and return it
	return `#${hash.slice(0, 6)}`;
};

// Create a custom transport that extends OpenTelemetryTransportV3
class CustomOpenTelemetryTransport extends OpenTelemetryTransportV3 {
	constructor(options: {
		loggerProvider: LoggerProvider;
		logAttributes: Record<string, string>;
	}) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		super(options as any);
	}
}

export class CustomLoggerService {
	dailyRotateFileTransport: DailyRotateFile;

	myFormat: winston.Logform.Format;

	createLoggerConfig: winston.LoggerOptions;

	static logger: winston.Logger;

	private loggerProvider?: LoggerProvider;

	static serviceName = 'cwgame-api';

	constructor(private readonly requestContextService: RequestContextService) {
		/** A transport for winston which logs to a rotating file based on date**/
		this.dailyRotateFileTransport = new DailyRotateFile({
			filename: `./logs/app_log-%DATE%.log`,
			zippedArchive: false,
			maxSize: '50m',
			maxFiles: '1d',
		});

		// Initialize SigNoz logger provider if enabled
		if (process.env.SIGNOZ_ENABLED === 'true') {
			this.loggerProvider = new LoggerProvider({});

			const otlpExporter = new OTLPLogExporter({
				url: process.env.SIGNOZ_ENDPOINT || 'http://localhost:4318/v1/logs',
				headers: {
					'Content-Type': 'application/json',
					'signoz-access-token': process.env.SIGNOZ_INGESTION_KEY || '',
				},
			});

			this.loggerProvider.addLogRecordProcessor(
				new SimpleLogRecordProcessor(otlpExporter),
			);

			// Set the global logger provider
			logs.setGlobalLoggerProvider(this.loggerProvider);
		}

		/**
		 * Custom log format tailored to our application's requirements
		 */
		this.myFormat = winston.format.printf(
			({ level = 'info', message, timestamp, req, ...metadata }) => {
				const requestId =
					this.requestContextService.get<string>('requestId') || '-';

				if (!req) {
					req = { headers: {} };
				}

				let msg = `${timestamp} [${level}] : ${message} `;
				const json: any = {
					timestamp,
					level,
					requestId,
					...metadata,
					message,
					error: {},
				};

				msg =
					process.env.NODE_ENV === 'development' ?
						JSON.stringify(json, null, 2)
					:	JSON.stringify(json);

				return msg;
			},
		);

		const transports: winston.transport[] = [
			new winston.transports.Console({
				level: 'info',
				format: winston.format.combine(
					winston.format.timestamp({
						format: 'YYYY-MM-DD HH:mm:ss Z',
					}),
					winston.format.errors({ stack: true }),
					winston.format.printf(({ level, timestamp, ...metadata }) => {
						const msg =
							process.env.NODE_ENV === 'development' ?
								chalkObject(metadata)
							:	JSON.stringify(metadata);
						// const msg =
						// 	process.env.NODE_ENV === 'development' ?
						// 		JSON.stringify(metadata, null, 2)
						// 	:	JSON.stringify(metadata);

						const requestId =
							this.requestContextService.get<string>('requestId') || '-';

						const coloredRequestID =
							process.env.NODE_ENV === 'development' ?
								chalk.hex(generateRequestColor(requestId))(requestId)
							:	requestId;

						return `${timestamp}[${coloredRequestID}][${chalk.bold.yellow(level)}]: ${msg}`;
					}),
				),
			}),
			this.dailyRotateFileTransport,
		];

		// Add SigNoz transport if enabled
		if (process.env.SIGNOZ_ENABLED === 'true' && this.loggerProvider) {
			const signozTransport = new CustomOpenTelemetryTransport({
				loggerProvider: this.loggerProvider,
				logAttributes: {
					serviceName: CustomLoggerService.serviceName,
					deploymentEnvironment: process.env.NODE_ENV || 'development',
				},
			});

			transports.push(signozTransport);
		}

		this.createLoggerConfig = {
			level: 'info',
			format: winston.format.combine(
				winston.format.splat(), // purpose: to support string interpolation
				winston.format.errors({ stack: true }), // purpose: to support error stack traces
				winston.format.json(), // purpose: to support JSON formatting
				winston.format.timestamp({
					format: 'YYYY-MM-DD HH:mm:ss Z', // purpose: to support timestamp formatting
				}),
				this.myFormat, // purpose: to support custom formatting
			),
			transports, // purpose: to support multiple transports
		};
	}
}
