import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { EVersion } from '../../../common/constants';
import { AuthenUser } from '../../../core/entities';
import { AuthUser } from '../../../decorators/auth-user.decorator';
import { Auth } from '../../../decorators/http.decorators';
import {
	CreateVirtualTourDto,
	UpdateVirtualTourDto,
	VirtualTourRequestDto,
} from './dto/virtual-tour.request.dto';
import {
	VirtualTourDetailDto,
	VirtualTourDto,
	VirtualTourListResponseDto,
} from './dto/virtual-tour.response.dto';
import { VirtualToursUseCase } from './virtual-tours.use-case';

@Controller({ path: '', version: EVersion.V1 })
@ApiTags('admin/virtual-tours')
export class VirtualToursController {
	constructor(private readonly virtualToursUseCase: VirtualToursUseCase) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Get all virtual tours',
		description:
			'Admin API to get all virtual tours with filtering and pagination',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Virtual tours retrieved successfully',
		type: VirtualTourListResponseDto,
	})
	async getVirtualTours(@Query() query: VirtualTourRequestDto) {
		return this.virtualToursUseCase.getVirtualTours(query);
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Get virtual tour by ID',
		description: 'Admin API to get virtual tour details by ID',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Virtual tour retrieved successfully',
		type: VirtualTourDetailDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	async getVirtualTourById(@Param('id') id: string) {
		return this.virtualToursUseCase.getVirtualTourById(id);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@Auth()
	@ApiOperation({
		summary: 'Create virtual tour',
		description: 'Admin API to create a new virtual tour',
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Virtual tour created successfully',
		type: VirtualTourDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input data',
	})
	async createVirtualTour(
		@Body() createDto: CreateVirtualTourDto,
		@AuthUser() user: AuthenUser,
	) {
		return this.virtualToursUseCase.createVirtualTour(createDto, user);
	}

	@Put(':id')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Update virtual tour',
		description: 'Admin API to update an existing virtual tour',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Virtual tour updated successfully',
		type: VirtualTourDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input data',
	})
	async updateVirtualTour(
		@Param('id') id: string,
		@Body() updateDto: UpdateVirtualTourDto,
		// @AuthUser() user?: TUser,
	) {
		return this.virtualToursUseCase.updateVirtualTour(id, updateDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@Auth()
	@ApiOperation({
		summary: 'Delete virtual tour',
		description: 'Admin API to delete a virtual tour (soft delete)',
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Virtual tour deleted successfully',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	async deleteVirtualTour(@Param('id') id: string) {
		return this.virtualToursUseCase.deleteVirtualTour(id);
	}

	@Post(':id/publish')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Publish virtual tour',
		description: 'Admin API to publish a virtual tour',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Virtual tour published successfully',
		type: VirtualTourDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Tour cannot be published (missing requirements)',
	})
	async publishVirtualTour(@Param('id') id: string) {
		return this.virtualToursUseCase.publishVirtualTour(id);
	}

	@Post(':id/archive')
	@HttpCode(HttpStatus.OK)
	@Auth()
	@ApiOperation({
		summary: 'Archive virtual tour',
		description: 'Admin API to archive a virtual tour',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Virtual tour archived successfully',
		type: VirtualTourDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	async archiveVirtualTour(@Param('id') id: string) {
		return this.virtualToursUseCase.archiveVirtualTour(id);
	}

	@Post(':id/duplicate')
	@HttpCode(HttpStatus.CREATED)
	@Auth()
	@ApiOperation({
		summary: 'Duplicate virtual tour',
		description: 'Admin API to create a copy of an existing virtual tour',
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Virtual tour duplicated successfully',
		type: VirtualTourDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Virtual tour not found',
	})
	async duplicateVirtualTour(
		@Param('id') id: string,
		@AuthUser() user: AuthenUser,
	) {
		return this.virtualToursUseCase.duplicateVirtualTour(id);
	}
}
