import { Injectable, Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import path from 'node:path';

import { EMediaType } from '../../common/constants/app-type';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { FileRequestUploadDto } from './dtos/file.request.dto';
import { FileResponseUploadDto } from './dtos/file.response.dto';
import { ICreateMediaFileDto, MediaFileService } from './media-file.service';

@Injectable()
export class FileService {
	private readonly logger = new Logger(FileService.name);

	constructor(
		private readonly localStorageService: LocalStorageService,
		private readonly mediaFileService: MediaFileService,
	) {}

	generateFileName(file: Express.Multer.File): string {
		const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

		// Log file information for debugging
		this.logger.debug('File info:', {
			originalname: file.originalname,
			mimetype: file.mimetype,
			size: file.size,
		});

		// Always prioritize original file extension to preserve the file format
		// But first check if originalname exists and is a string
		let fileExtension = '';

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (file.originalname && typeof file.originalname === 'string') {
			fileExtension = path.extname(file.originalname);
		}

		// Use MIME type as fallback if no original extension exists
		if (!fileExtension && file.mimetype) {
			const mimeExtension = file.mimetype.split('/')[1];
			fileExtension = `.${mimeExtension}`;
		}

		// Ensure we have a valid extension
		if (!fileExtension) {
			fileExtension = '.bin'; // fallback for unknown types
		}

		const uniqueId = nanoid();
		const fileName = `${timestamp}/${uniqueId}${fileExtension}`;

		this.logger.debug('Generated filename:', fileName);

		return fileName;
	}

	async createMediaFiles(
		fileToUploads: Express.Multer.File[],
		filePaths: string[],
		uploadedById?: string,
	) {
		const mediaFileIds: string[] = [];

		try {
			for (const [index, file] of fileToUploads.entries()) {
				const mediaType = this.mediaFileService.determineMediaType(
					file.mimetype,
				);

				const createMediaFileData: ICreateMediaFileDto = {
					originalName: file.originalname || 'unknown',
					fileName: path.basename(filePaths[index]),
					filePath: filePaths[index],
					fileSize: file.size,
					mimeType: file.mimetype,
					mediaType,
					uploadedById,
					storageProvider: 'local',
				};

				const mediaFile =
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-await-in-loop
					await this.mediaFileService.createMediaFile(createMediaFileData);

				mediaFileIds.push(mediaFile.id);

				// Mark as ready after successful upload
				// eslint-disable-next-line no-await-in-loop
				await this.mediaFileService.markAsReady(
					mediaFile.id,
					'File uploaded successfully',
				);
			}

			return mediaFileIds;
		} catch (error) {
			this.logger.error('Failed to create media file records:', error);
			await Promise.all(
				mediaFileIds.map((id) =>
					this.mediaFileService.markAsFailed(id, 'File uploaded failed'),
				),
			);
		}
	}

	async handleUpload(
		data: FileRequestUploadDto,
		isUrl: boolean,
		uploadedById?: string,
	): Promise<{ message: string; files: FileResponseUploadDto[] }> {
		const { files } = data;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!files || !Array.isArray(files)) {
			throw new Error('Invalid files data received');
		}

		const fileToUploads = files;

		// Validate each file object
		for (const [index, file] of fileToUploads.entries()) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!file || !file.buffer) {
				throw new Error(
					`Invalid file object at index ${index}: missing buffer`,
				);
			}

			this.logger.debug(`Processing file ${index}:`, {
				originalname: file.originalname,
				mimetype: file.mimetype,
				size: file.size,
			});
		}

		// Make sure keep same file extension using the proper generateFileName method
		const filePaths = fileToUploads.map((file) => this.generateFileName(file));

		// Check if isCreateThumbnail is true
		// if (data.isCreateThumbnail) {
		// 	// Create thumbnail
		// 	const thumbnailFilePath = this.generateThumbnailFileName(filePaths[0]);
		// 	filePaths.push(thumbnailFilePath);
		// }

		const [uploadedFilePaths, mediaFileIds] = await Promise.all([
			this.localStorageService.uploadFiles(
				filePaths.map((filePath, index) => ({
					key: filePath,
					file: fileToUploads[index].buffer,
					contentType: fileToUploads[index].mimetype,
				})),
			),
			this.createMediaFiles(fileToUploads, filePaths, uploadedById),
		]);

		// Handle multiple files
		const responseFiles = await Promise.all(
			filePaths.map(async (filePath, index) => {
				const response: FileResponseUploadDto = {
					filePath,
				};

				if (isUrl) {
					response.url = await this.localStorageService.getFileUrl(filePath);
				}

				if (mediaFileIds?.[index]) {
					response.mediaFileId = mediaFileIds[index];
				}

				// if (data.isCreateThumbnail) {
				// 	response.thumbnailFilePath =
				// 		await this.localStorageService.getFileUrl(thumbnailFilePath);
				// }

				return response;
			}),
		);

		return {
			message: 'Files uploaded successfully',
			files: responseFiles,
		};
	}
}
