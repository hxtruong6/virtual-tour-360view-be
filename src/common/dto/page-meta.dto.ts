import { BooleanField, NumberField } from '../../decorators/field.decorators';
import { type PageOptionsDto } from './page-options.dto';

interface IPageMetaDtoParameters {
	pageOptionsDto: PageOptionsDto;
	itemCount: number;
}

export class PageMetaDto {
	@NumberField()
	readonly page: number;

	@NumberField()
	readonly pageSize: number;

	@NumberField()
	readonly itemCount: number;

	@NumberField()
	readonly pageCount: number;

	@BooleanField()
	readonly hasPreviousPage: boolean;

	@BooleanField()
	readonly hasNextPage: boolean;

	constructor({ pageOptionsDto, itemCount }: IPageMetaDtoParameters) {
		this.page = pageOptionsDto.page;
		this.pageSize = pageOptionsDto.pageSize;
		this.itemCount = itemCount;
		this.pageCount = Math.ceil(this.itemCount / this.pageSize);
		this.hasPreviousPage = this.page > 1;
		this.hasNextPage = this.page < this.pageCount;
	}
}
