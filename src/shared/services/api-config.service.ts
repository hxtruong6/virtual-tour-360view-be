import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type ThrottlerOptions } from '@nestjs/throttler';
import { isNil } from 'lodash';
import { type Units, default as parse } from 'parse-duration';

import { LanguageCode } from '../../common/constants';
import { type IDatabaseOptions } from '../../infrastructure/database/database-option';

@Injectable()
export class ApiConfigService {
	constructor(private configService: ConfigService) {
		// console.info('ENV:', process.env);
	}

	get cwgameConfig() {
		return {
			isDev: true,
		};
	}

	get grpcConfig() {
		return {
			enabled: this.getBoolean('GRPC_ENABLED'),
			host: this.getString('GRPC_HOST') || 'localhost',
			port: this.getNumber('GRPC_PORT') || 5000,
		};
	}

	get nakamaConfig() {
		return {
			host: this.getString('NAKAMA_HOST'),
			port: this.getNumber('NAKAMA_PORT'),
			apiKey: this.getString('NAKAMA_API_KEY'),
			useSSL: this.getBoolean('NAKAMA_USE_SSL'),
		};
	}

	get isDevelopment(): boolean {
		return this.nodeEnv === 'development';
	}

	get isProduction(): boolean {
		return this.nodeEnv === 'production';
	}

	get isTest(): boolean {
		return this.nodeEnv === 'test';
	}

	getNumber(key: string): number {
		const value = this.get(key);

		try {
			return Number(value);
		} catch {
			throw new Error(key + ' environment variable is not a number');
		}
	}

	private getDuration(key: string, format?: Units): number {
		const value = this.getString(key);
		const duration = parse(value, format);

		if (!duration) {
			throw new Error(`${key} environment variable is not a valid duration`);
		}

		return duration;
	}

	private getBoolean(key: string): boolean {
		const value = this.get(key);

		try {
			return Boolean(JSON.parse(value));
		} catch {
			throw new Error(key + ' env var is not a boolean');
		}
	}

	private getString(key: string): string {
		const value = this.get(key);

		if (!value) {
			throw new Error(key + ' environment variable does not set');
		}

		return value.replaceAll(String.raw`\n`, '\n');
	}

	get nodeEnv(): string {
		return this.getString('NODE_ENV');
	}

	get fallbackLanguage(): string {
		return this.getString('FALLBACK_LANGUAGE') || LanguageCode.en_US;
	}

	get throttlerConfigs(): ThrottlerOptions {
		return {
			ttl: this.getDuration('THROTTLER_TTL', 'second'),
			limit: this.getNumber('THROTTLER_LIMIT'),
			// storage: new ThrottlerStorageRedisService(new Redis(this.redis)),
		};
	}

	get databaseOptions(): IDatabaseOptions {
		return {
			host: this.getString('DB_HOST'),
			port: this.getNumber('DB_PORT'),
			username: this.getString('DB_USERNAME'),
			password: this.getString('DB_PASSWORD'),
			database: this.getString('DB_DATABASE'),
		};
	}

	get awsS3Config() {
		return {
			bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
			bucketApiVersion: this.getString('AWS_S3_API_VERSION'),
			bucketName: this.getString('AWS_S3_BUCKET_NAME'),
		};
	}

	get gcloudStorageConfig() {
		return {
			bucketName: this.getString('GCP_STORAGE_BUCKET_NAME'),
			bucketProjectId: this.getString('GCP_STORAGE_BUCKET_PROJECT_ID'),
			// File path to your service account key file
			bucketKeyFilename: this.getString('GCP_STORAGE_BUCKET_KEY_FILENAME'),
		};
	}

	get paymongoConfig() {
		return {
			secretKey: this.getString('PAYMONGO_SECRET_KEY'),
			publicKey: this.getString('PAYMONGO_PUBLIC_KEY'),
		};
	}

	get googleMapsConfig() {
		return {
			accessKey: this.getString('GOOGLE_MAPS_ACCESS_KEY'),
		};
	}

	get documentationEnabled(): boolean {
		return this.getBoolean('ENABLE_DOCUMENTATION');
	}

	get natsEnabled(): boolean {
		return this.getBoolean('NATS_ENABLED');
	}

	get natsConfig() {
		return {
			host: this.getString('NATS_HOST'),
			port: this.getNumber('NATS_PORT'),
		};
	}

	get authConfig() {
		return {
			// privateKey: this.getString('JWT_PRIVATE_KEY'),
			// publicKey: this.getString('JWT_PUBLIC_KEY'),
			secret: this.getString('JWT_SECRET'),
			jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME') || 3600, // 1 hour
			refreshTokenExpirationTime:
				this.getNumber('REFRESH_TOKEN_EXPIRATION_TIME') || 604_800, // 7 days
		};
	}

	get appConfig() {
		return {
			port: this.getString('PORT'),
			frontendUrl: this.getString('FRONTEND_URL'),
		};
	}

	private get(key: string): string {
		const value = this.configService.get<string>(key);

		if (isNil(value)) {
			throw new Error(key + ' environment variable does not set'); // probably we should call process.exit() too to avoid locking the service
		}

		return value;
	}

	get twilioConfig() {
		return {
			authToken: this.getString('TWILIO_AUTH_TOKEN'),
			accountSid: this.getString('TWILIO_ACCOUNT_SID'),
			phoneNumber: this.getString('TWILIO_PHONE_NUMBER'),
			recipientPhoneNumber: this.getString('TWILIO_RECIPIENT_PHONE_NUMBER'),
		};
	}

	get redisUri(): string {
		return this.getString('REDIS_URI');
	}

	get mailtrapConfig() {
		return {
			token: this.getString('MAILTRAP_TOKEN'),
			senderEmail: this.getString('MAILTRAP_SENDER_EMAIL'),
			senderName: this.getString('MAILTRAP_SENDER_NAME'),
		};
	}

	get emailConfig() {
		return {
			host: this.getString('SMTP_HOST'),
			port: this.getNumber('SMTP_PORT'),
			secure: this.getBoolean('SMTP_SECURE'),
			user: this.getString('SMTP_USER'),
			pass: this.getString('SMTP_PASSWORD'),
			fromEmail: this.getString('SMTP_FROM_EMAIL'),
			fromName: this.getString('SMTP_FROM_NAME'),
		};
	}

	get serverStorageFolderConfig() {
		return {
			folderName: this.getString('SERVER_STORAGE_FOLDER_NAME'),
		};
	}
}
