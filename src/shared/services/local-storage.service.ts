import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { ApiConfigService } from './api-config.service';

export interface IUploadFileData {
	key: string;
	file: Buffer;
	contentType: string;
}

@Injectable()
export class LocalStorageService {
	private readonly logger = new Logger(LocalStorageService.name);

	private readonly uploadDir: string;

	constructor(private readonly configService: ApiConfigService) {
		const storageConfig = this.configService.serverStorageFolderConfig;
		this.uploadDir = storageConfig.folderName || './uploads';

		try {
			void this.ensureUploadDirectoryExists();
		} catch (error) {
			this.logger.error('Failed to initialize upload directory', error);
		}
	}

	private async ensureUploadDirectoryExists(): Promise<void> {
		try {
			await fs.access(this.uploadDir);
		} catch {
			await fs.mkdir(this.uploadDir, { recursive: true });
			this.logger.log(`Created upload directory: ${this.uploadDir}`);
		}
	}

	async uploadFile(data: IUploadFileData): Promise<string> {
		const filePath = path.join(this.uploadDir, data.key);
		const fileDir = path.dirname(filePath);

		// Ensure directory exists
		await fs.mkdir(fileDir, { recursive: true });

		// Write file
		await fs.writeFile(filePath, data.file);

		this.logger.log(`File uploaded successfully: ${data.key}`);

		return data.key;
	}

	async uploadFiles(files: IUploadFileData[]): Promise<string[]> {
		const uploadPromises = files.map((file) => this.uploadFile(file));

		return Promise.all(uploadPromises);
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async getFileUrl(key: string): Promise<string> {
		// Return the relative URL path for serving static files with API version
		return `/api/v1/files/serve/${key}`;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async getFilePath(key: string): Promise<string> {
		return path.join(this.uploadDir, key);
	}

	async fileExists(key: string): Promise<boolean> {
		try {
			const filePath = path.join(this.uploadDir, key);
			await fs.access(filePath);

			return true;
		} catch {
			return false;
		}
	}

	async deleteFile(key: string): Promise<void> {
		try {
			const filePath = path.join(this.uploadDir, key);
			await fs.unlink(filePath);
			this.logger.log(`File deleted successfully: ${key}`);
		} catch (error) {
			this.logger.error(`Failed to delete file: ${key}`, error);

			throw error;
		}
	}

	getUploadDirectory(): string {
		return this.uploadDir;
	}
}
