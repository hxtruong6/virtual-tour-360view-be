import {
	BadRequestException,
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	Post,
	Query,
	Res,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FormDataRequest } from 'nestjs-form-data';
import path from 'node:path';

import { EVersion } from '../../common/constants';
import { Auth } from '../../decorators';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { FileRequestUploadDto } from './dtos/file.request.dto';
import { FileResponseUploadDto } from './dtos/file.response.dto';
import { FileService } from './file.service';

@ApiTags('Files')
@Controller({ path: 'files', version: EVersion.V1 })
export class FilesController {
	constructor(
		private readonly localStorageService: LocalStorageService,
		private readonly fileService: FileService,
	) {}

	@Get('file-url')
	async getFileUrl(
		@Query('fileName') fileName: string,
	): Promise<{ url: string }> {
		return {
			url: await this.localStorageService.getFileUrl(fileName),
		};
	}

	@Get('serve/:filePath')
	@Auth({ options: { public: true } })
	async serveFile(
		@Param('filePath') filePath: string,
		@Res() res: Response,
	): Promise<void> {
		try {
			console.info('xxx filePath', filePath);
			const isExists = await this.localStorageService.fileExists(filePath);

			if (!isExists) {
				throw new NotFoundException('File not found');
			}

			const fullPath = await this.localStorageService.getFilePath(filePath);
			const fileName = path.basename(filePath);

			res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
			res.sendFile(path.resolve(fullPath));
		} catch {
			throw new NotFoundException('File not found');
		}
	}

	@Post('upload')
	@Auth({ options: { public: true } })
	@FormDataRequest()
	@ApiResponse({ status: 201, description: 'File uploaded successfully' })
	@ApiResponse({ status: 400, description: 'Validation failed' })
	async uploadFiles(
		@Body() dataDto: FileRequestUploadDto,
		@Query('isUrl') isUrl = false,
	): Promise<{
		message: string;
		files: FileResponseUploadDto[];
	}> {
		const { files } = dataDto;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!files || files.length === 0) {
			throw new BadRequestException('Files is required');
		}

		return this.fileService.handleUpload(dataDto, isUrl);
	}
}
