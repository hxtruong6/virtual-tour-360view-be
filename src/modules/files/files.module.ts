import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

import { SharedModule } from '../../shared/shared.module';
import { FileService } from './file.service';
import { FilesController } from './files.controller';

@Module({
	imports: [SharedModule, NestjsFormDataModule],
	controllers: [FilesController],
	providers: [FileService],
	exports: [FileService],
})
export class FilesModule {}
