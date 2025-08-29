import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';
import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import mime from 'mime-types';

import { ECacheTime } from '../../common/constants';
import { ApiConfigService } from './api-config.service';
import { CacheService } from './cache.service';
import { GeneratorService } from './generator.service';

@Injectable()
export class GcloudStorageService {
	private readonly storage: Storage;

	private readonly bucketName: string;

	private readonly logger = new Logger(GcloudStorageService.name);

	constructor(
		public configService: ApiConfigService,
		public generatorService: GeneratorService,
		private cacheService: CacheService,
	) {
		const config = configService.gcloudStorageConfig;

		this.storage = new Storage({
			projectId: config.bucketProjectId,
			keyFilename: config.bucketKeyFilename,
		});

		this.bucketName = config.bucketName;
	}

	async getFile(key: string): Promise<string | undefined> {
		const response = await this.storage.bucket(this.bucketName).file(key).get();

		return response[0].publicUrl();
	}

	async getPresignedUrl(key: string): Promise<string> {
		const [url] = await this.storage
			.bucket(this.bucketName)
			.file(key)
			.getSignedUrl({
				action: 'write',
				expires: '01-01-2099',
			});

		return url;
	}

	async generatePresignedUrl(
		fileName: string,
		contentType: string,
		expiresIn = 3600, // Default expiration: 1 hour
	): Promise<string> {
		const bucket = this.storage.bucket(this.bucketName);
		const file = bucket.file(fileName);

		const contentTypeMime = <string>mime.contentType(contentType);

		if (!contentTypeMime) {
			throw new BadRequestException('Invalid content type');
		}

		const options = {
			version: 'v4', // Use V4 signing
			action: 'write',
			expires: Date.now() + expiresIn * 1000, // Expiry time in milliseconds
			contentType: contentTypeMime, // Enforce content type for upload
		} as GetSignedUrlConfig;

		try {
			const presignedUrlResp = await file.getSignedUrl(options);
			this.logger.log(`Generated pre-signed URL for: ${presignedUrlResp}`);

			return presignedUrlResp[0];
		} catch (error) {
			this.logger.error('Error generating pre-signed URL', error);

			throw new InternalServerErrorException(
				'Failed to generate pre-signed URL',
			);
		}
	}

	async getFileUrl(key: string, expiresInMinutes = 15): Promise<string> {
		// cache
		const cacheKey = `gcs-file-url-${key}`;
		const cachedUrl = await this.cacheService.get(cacheKey);

		if (cachedUrl) {
			return cachedUrl as string;
		}

		console.info('not cache:', key);

		const [url] = await this.storage
			.bucket(this.bucketName)
			.file(key)
			.getSignedUrl({
				action: 'read',
				expires: Date.now() + expiresInMinutes * 60 * 1000,
			});

		await this.cacheService.set(cacheKey, url, ECacheTime.FIFTEEN_MINUTES);

		return url;
	}

	// async getFileUrls(keys: string[]): Promise<string[]> {
	// 	const urls = await this.storage.bucket(this.bucketName).getFiles({
	// 		prefix: keys.join('/'),
	// 	});

	// 	return urls.map((url) => url.publicUrl()) as string[];
	// }

	async deleteFile(key: string): Promise<void> {
		await this.storage
			.bucket(this.bucketName)
			.file(key)
			.delete({ ignoreNotFound: true });
	}

	async uploadFile(
		key: string,
		file: Buffer,
		contentType: string,
	): Promise<void> {
		await this.storage.bucket(this.bucketName).file(key).save(file, {
			contentType,
		});
	}

	async uploadFiles(
		files: Array<{
			key: string;
			file: Buffer;
			contentType: string;
		}>,
	): Promise<void> {
		await Promise.all(
			files.map(({ key, file, contentType }) =>
				this.storage.bucket(this.bucketName).file(key).save(file, {
					contentType,
				}),
			),
		);
	}

	async downloadFile(key: string): Promise<Buffer> {
		const [buffer] = await this.storage
			.bucket(this.bucketName)
			.file(key)
			.download();

		return buffer;
	}
}
