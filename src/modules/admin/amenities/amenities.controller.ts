import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { EVersion } from '../../../common/constants/enums';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import { Auth, UUIDParam } from '../../../decorators';
import { AmenitiesUseCase } from './amenities.use-case';
import {
	AssignAmenityToTourDto,
	CreateAmenityDto,
	UpdateAmenityDto,
} from './dto/amenity.request.dto';
import { AmenityDto, AmenityListResponseDto } from './dto/amenity.response.dto';

@Controller({ path: '', version: EVersion.V1 })
@ApiTags('Admin - Amenities')
export class AmenitiesController {
	constructor(private readonly amenitiesUseCase: AmenitiesUseCase) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Get all amenities with pagination' })
	@ApiOkResponse({
		description: 'Successfully retrieved amenities',
		type: AmenityListResponseDto,
	})
	async getAllAmenities(
		@Query() pageOptionsDto: PageOptionsDto,
		@Query('category') category?: string,
	): Promise<AmenityListResponseDto> {
		return this.amenitiesUseCase.getAllAmenities(pageOptionsDto, category);
	}

	@Get('active')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Get active amenities only' })
	@ApiOkResponse({
		description: 'Successfully retrieved active amenities',
		type: [AmenityDto],
	})
	async getActiveAmenities(
		@Query('category') category?: string,
	): Promise<AmenityDto[]> {
		return this.amenitiesUseCase.getActiveAmenities(category);
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Get amenity by ID' })
	@ApiOkResponse({
		description: 'Successfully retrieved amenity',
		type: AmenityDto,
	})
	async getAmenityById(@UUIDParam('id') id: string): Promise<AmenityDto> {
		return this.amenitiesUseCase.getAmenityById(id);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create a new amenity' })
	@ApiCreatedResponse({
		description: 'Amenity created successfully',
		type: AmenityDto,
	})
	async createAmenity(
		@Body() createAmenityDto: CreateAmenityDto,
	): Promise<AmenityDto> {
		return this.amenitiesUseCase.createAmenity(createAmenityDto);
	}

	@Put(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Update an amenity' })
	@ApiOkResponse({
		description: 'Amenity updated successfully',
		type: AmenityDto,
	})
	async updateAmenity(
		@UUIDParam('id') id: string,
		@Body() updateAmenityDto: UpdateAmenityDto,
	): Promise<AmenityDto> {
		return this.amenitiesUseCase.updateAmenity(id, updateAmenityDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete an amenity' })
	@ApiNoContentResponse({
		description: 'Amenity deleted successfully',
	})
	async deleteAmenity(@UUIDParam('id') id: string): Promise<void> {
		return this.amenitiesUseCase.deleteAmenity(id);
	}

	@Post('tours/:tourId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Assign amenities to a tour' })
	@ApiNoContentResponse({
		description: 'Amenities assigned to tour successfully',
	})
	async assignAmenitiesToTour(
		@UUIDParam('tourId') tourId: string,
		@Body() assignAmenityDto: AssignAmenityToTourDto,
	): Promise<void> {
		return this.amenitiesUseCase.assignAmenitiesToTour(
			tourId,
			assignAmenityDto,
		);
	}

	@Get('tours/:tourId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Get amenities for a specific tour' })
	@ApiOkResponse({
		description: 'Successfully retrieved tour amenities',
		type: [AmenityDto],
	})
	async getTourAmenities(@UUIDParam('tourId') tourId: string) {
		return this.amenitiesUseCase.getTourAmenities(tourId);
	}

	@Delete('tours/:tourId/:amenityId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Remove amenity from tour' })
	@ApiNoContentResponse({
		description: 'Amenity removed from tour successfully',
	})
	async removeAmenityFromTour(
		@UUIDParam('tourId') tourId: string,
		@UUIDParam('amenityId') amenityId: string,
	): Promise<void> {
		return this.amenitiesUseCase.removeAmenityFromTour(tourId, amenityId);
	}
}
