import { Injectable, Logger } from '@nestjs/common';

import { EMediaStatus, EMediaType } from '../../common/constants/app-type';
import { MediaType } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';

export interface ICreateMediaFileDto {
	originalName: string;
	fileName: string;
	filePath: string;
	fileSize: number;
	mimeType: string;
	mediaType: MediaType;
	uploadedById?: string;
	width?: number;
	height?: number;
	duration?: number;
	storageProvider?: string;
	externalUrl?: string;
}

export interface IUpdateMediaFileDto {
	status?: EMediaStatus;
	processingLog?: string;
	thumbnailPath?: string;
	compressedPath?: string;
	width?: number;
	height?: number;
	duration?: number;
	externalUrl?: string;
}

export interface IMediaFileQueryDto {
	mediaType?: EMediaType;
	status?: EMediaStatus;
	uploadedById?: string;
	galleryCategory?: string;
	limit?: number;
	offset?: number;
}

@Injectable()
export class MediaFileService {
	private readonly logger = new Logger(MediaFileService.name);

	constructor(
		private readonly prismaService: PrismaService,
		private readonly localStorageService: LocalStorageService,
	) {}

	/**
	 * Create a new media file record in the database
	 */
	async createMediaFile(data: ICreateMediaFileDto) {
		const mediaFile = await this.prismaService.mediaFile.create({
			data: {
				originalName: data.originalName,
				fileName: data.fileName,
				filePath: data.filePath,
				fileSize: data.fileSize,
				mimeType: data.mimeType,
				mediaType: data.mediaType,
				uploadedById: data.uploadedById,
				width: data.width,
				height: data.height,
				duration: data.duration,
				storageProvider: data.storageProvider || 'local',
				externalUrl: data.externalUrl,
				status: EMediaStatus.UPLOADING,
			},
		});

		this.logger.debug(`Created media file: ${mediaFile.id}`);

		return mediaFile;
	}

	/**
	 * Update an existing media file record
	 */
	async updateMediaFile(id: string, data: IUpdateMediaFileDto) {
		const mediaFile = await this.prismaService.mediaFile.update({
			where: { id },
			data: {
				status: data.status,
				processingLog: data.processingLog,
				thumbnailPath: data.thumbnailPath,
				compressedPath: data.compressedPath,
				width: data.width,
				height: data.height,
				duration: data.duration,
				externalUrl: data.externalUrl,
			},
		});

		this.logger.debug(`Updated media file: ${id}`);

		return mediaFile;
	}

	/**
	 * Get a media file by ID
	 */
	getMediaFileById(id: string) {
		return this.prismaService.mediaFile.findUnique({
			where: { id },
		});
	}

	/**
	 * Get a media file by file name
	 */
	getMediaFileByFileName(fileName: string) {
		return this.prismaService.mediaFile.findUnique({
			where: { fileName },
		});
	}

	/**
	 * Get media files by uploaded user ID
	 */
	async getMediaFilesByUserId(userId: string, limit = 50, offset = 0) {
		return this.prismaService.mediaFile.findMany({
			where: { uploadedById: userId },
			orderBy: { createdAt: 'desc' },
			take: limit,
			skip: offset,
		});
	}

	/**
	 * Permanently delete a media file record
	 */
	async permanentlyDeleteMediaFile(id: string) {
		try {
			const mediaFile = await this.prismaService.mediaFile.delete({
				where: { id },
			});

			// Delete the file from the storage
			await this.localStorageService.deleteFile(mediaFile.filePath);

			this.logger.debug(`Permanently deleted media file: ${id}`);

			return mediaFile;
		} catch (error) {
			this.logger.error(
				`Failed to permanently delete media file ${id}: ${(error as Error).message}`,
			);

			throw error;
		}
	}

	/**
	 * Determine media type from MIME type
	 */
	determineMediaType(mimeType: string): MediaType {
		if (mimeType.startsWith('image/')) {
			return MediaType.IMAGE;
		}

		if (mimeType.startsWith('video/')) {
			return MediaType.VIDEO;
		}

		if (mimeType.startsWith('audio/')) {
			return MediaType.AUDIO;
		}

		return MediaType.DOCUMENT;
	}

	/**
	 * Mark media file as ready
	 */
	async markAsReady(id: string, processingLog?: string) {
		return this.updateMediaFile(id, {
			status: EMediaStatus.READY,
			processingLog,
		});
	}

	async markAsFailed(id: string, processingLog?: string) {
		return this.updateMediaFile(id, {
			status: EMediaStatus.FAILED,
			processingLog,
		});
	}
}
