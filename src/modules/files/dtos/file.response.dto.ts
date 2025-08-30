import { StringField, StringFieldOptional } from '../../../decorators';

export class FileResponseUploadDto {
	@StringFieldOptional()
	message?: string;

	@StringField()
	filePath!: string;

	@StringField()
	url?: string;
}
