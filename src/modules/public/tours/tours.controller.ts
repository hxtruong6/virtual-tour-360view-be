import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EVersion } from '../../../common/constants';
import { PublicTourRequestDto } from './dto/public-tour.request.dto';
import {
	PublicTourDetailDto,
	PublicTourDto,
	PublicTourListResponseDto,
} from './dto/public-tour.response.dto';
import { PublicToursUseCase } from './tours.use-case';

@Controller({ path: '', version: EVersion.V1 })
@ApiTags('public/tours')
export class PublicToursController {
	constructor(private readonly publicToursUseCase: PublicToursUseCase) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get published virtual tours',
		description:
			'Public API to get all published virtual tours with filtering and pagination',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Published virtual tours retrieved successfully',
		type: PublicTourListResponseDto,
	})
	getPublishedTours(@Query() query: PublicTourRequestDto) {
		return this.publicToursUseCase.getPublishedTours(query);
	}

	@Get(':slug')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get virtual tour by slug or id',
		description: 'Public API to get virtual tour details by slug or id',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Virtual tour retrieved successfully',
		type: PublicTourDetailDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	getTourBySlug(@Param('slug') slug: string) {
		return this.publicToursUseCase.getTourBySlug(slug);
	}
}
