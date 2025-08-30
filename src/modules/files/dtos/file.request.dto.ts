// import { Type } from 'class-transformer';
// import { IsArray, ValidateNested } from 'class-validator';
import {
	HasMimeType,
	IsFile,
	IsFiles,
	MaxFileSize,
	MinFileSize,
} from 'nestjs-form-data';

export class SingleFileRequestUploadDto {
	@IsFile()
	@MaxFileSize(1 * 1024 * 1024 * 1024) // 1GB MB
	@MinFileSize(100) // 100 bytes
	@HasMimeType([
		'image/png',
		'image/jpeg',
		'image/gif',
		'application/pdf',
		'text/plain',
		'application/json',
		'image/webp',
		'image/svg+xml',
		'application/msword',
		'application/vnd.ms-excel',
		'application/vnd.ms-powerpoint',
	])
	file!: Express.Multer.File;
}

export class FileRequestUploadDto {
	@IsFiles({ each: true, message: 'Files must be an array' })
	files!: Express.Multer.File[];
}
